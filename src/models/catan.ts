import _ from 'lodash';
import { Board } from './board.ts';
import { Player } from './player.ts';
import { Vertex } from './vertex.ts';
import { Edge } from './edge.ts';
import type {
  Components,
  Components,
  GamePhase,
  GameState,
  PlayersList,
  RollDice,
} from '../types.ts';

export class Catan {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  winner: string | null;
  diceRoll: [number, number] | [];
  board: Board;
  turns: number;
  diceFn: RollDice;

  constructor(
    gameId: string,
    players: Player[],
    board: Board,
    diceFn: (start?: number, end?: number) => number,
  ) {
    this.diceFn = diceFn;
    this.gameId = gameId;
    this.players = players;
    this.currentPlayerIndex = 0;
    this.phase = 'setup';
    this.winner = null;
    this.diceRoll = [1, 1];
    this.board = board;
    this.turns = 0;
  }

  changePhase(): void {
    if (this.turns === 16) this.phase = 'main';
  }

  reverseOrder(): void {
    if (this.turns === 8) this.currentPlayerIndex = 4;
    this.currentPlayerIndex--;
  }

  private arePlacingSecondSettlement() {
    return this.turns >= 8 && this.turns < 16;
  }

  changeTurn(): void {
    this.changePhase();

    if (this.arePlacingSecondSettlement()) return this.reverseOrder();
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  rollDice(): [number, number] {
    const dice1 = this.diceFn(1, 6);
    const dice2 = this.diceFn(1, 6);
    this.diceRoll = [dice1, dice2];
    this.turns++;
    this.changeTurn();
    return this.diceRoll;
  }

  isInitialSetup(): boolean {
    return this.phase === 'setup';
  }

  private getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  private isCurrentPlayer(playerId: string) {
    return this.getCurrentPlayer().id === playerId;
  }

  canRoll(playerId: string): boolean {
    return !this.isInitialSetup() && this.isCurrentPlayer(playerId);
  }

  private getEdge(id: string): Edge | undefined {
    return this.board.edges.get(id);
  }

  private getVertex(id: string): Vertex | undefined {
    return this.board.vertices.get(id);
  }

  private isVertexOccupied(vertexId: string) {
    return this.getVertex(vertexId)?.isOccupied();
  }

  private isVertexValid(vertexId: string) {
    return this.board.vertices.has(vertexId);
  }

  private isDistanceRuleFollowed(vertexId: string) {
    const vertex = this.getVertex(vertexId);
    const adjacentVertices = vertex?.connectedVertices || [];

    return [...adjacentVertices].every((vtx) => !this.isVertexOccupied(vtx));
  }

  private setupValidation(vertexId: string): boolean {
    return (
      this.isVertexValid(vertexId) &&
      !this.isVertexOccupied(vertexId) &&
      this.isDistanceRuleFollowed(vertexId)
    );
  }

  private hasConnectedSettlement(edgeId: string): boolean {
    const edge = this.getEdge(edgeId);
    const currentPlayerId = this.getCurrentPlayer().id;
    const adjacentVertexIds = edge?.vertices || [];

    return [...adjacentVertexIds].some(
      (vtxId: string) => this.getVertex(vtxId)?.owner === currentPlayerId,
      (vtxId: string) => this.getVertex(vtxId)?.owner === currentPlayerId,
    );
  }

  private hasOwnedAdjacentRoad(edgeId: string) {
    const edge = this.getEdge(edgeId);
    const adjacentVertexIds = edge?.vertices || [];

    return [...adjacentVertexIds].some((vtxId) => this.hasConnectedRoad(vtxId));
  }

  private canBuildRoad(edge: string) {
    const isRoadOccupied = this.getEdge(edge)?.isOccupied();
    const hasConnectedSettlement = this.hasConnectedSettlement(edge);
    const hasConnectedRoad = this.hasOwnedAdjacentRoad(edge);

    return !isRoadOccupied && (hasConnectedSettlement || hasConnectedRoad);
  }

  canBuildInitialSettlement(settlementId: string): boolean {
    return this.turns % 2 === 0 && this.setupValidation(settlementId);
  }

  private isNearLatestSettlement(roadId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    const latestSettlement = currentPlayer.settlements.at(-1) || '';
    const roads = this.getVertex(latestSettlement)?.connectedEdges;

    return roads?.has(roadId) || false;
  }

  canBuildInitialRoad(roadId: string): boolean {
    return (
      this.turns % 2 === 1 &&
      this.isNearLatestSettlement(roadId) &&
      this.canBuildRoad(roadId)
    );
  }

  buildRoad(edgeId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    this.getEdge(edgeId)?.occupy(currentPlayer.id, currentPlayer.color);
    currentPlayer.roads.push(edgeId);
    this.turns++;
    this.changeTurn();

    return true;
  }

  distributeResources(vertexId: string, player: Player, count: number): void {
    const hexes = this.getVertex(vertexId)?.adjacentHexes;
    const resources = hexes?.map(
      (hexId) => this.board.hexes.get(hexId)?.resource,
      (hexId) => this.board.hexes.get(hexId)?.resource,
    );

    resources?.forEach((resource) => {
      if (resource) player.addResource(resource, count);
    });
  }

  buildSettlement(vertexId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();

    this.getVertex(vertexId)?.occupy(currentPlayer.id, currentPlayer.color);
    currentPlayer.settlements.push(vertexId);

    if (currentPlayer.settlements.length === 2) {
      this.distributeResources(vertexId, currentPlayer, 1);
    }
    this.turns++;

    return true;
  }

  abstractPlayerData(player: Player): object {
    const data = player.getPlayerData();
    const resources = _.sum(_.values(data.resources));
    const devCards = _.sum(_.values(data.devCards));

    return { ...data, resources, devCards };
  }

  getPlayersInfo(playerId: string): PlayersList {
    const [[player], others] = _.partition(
      this.players,
      (p: Player) => p.id === playerId,
      (p: Player) => p.id === playerId,
    );

    const me = player.getPlayerData();
    const othersData = others.map((other: Player) =>
      this.abstractPlayerData(other),
    );
    return { me, others: othersData };
  }

  getAvailableActions(playerId: string) {
    const canRoll = this.isCurrentPlayer(playerId) && !this.isInitialSetup();
    return { canRoll };
  }

  getGameState(playerId: string): GameState {
    const players = this.getPlayersInfo(playerId);
    const board = this.board.getBoard();
    const currentPlayerId = this.getCurrentPlayer().id;
    const { gameId, diceRoll } = this;
    const availableActions = this.getAvailableActions(playerId);

    const playersData = { playerId, players, currentPlayerId };
    return {
      gameId,
      diceRoll,
      board,
      availableActions,
      ...playersData,
    };
  }

  private extractOccupiedComponents(
    componentsMap: Map<string, Vertex | Edge>,
    occupiedComponents: Components[],
    occupiedComponents: Components[],
  ) {
    componentsMap.forEach((component: Vertex | Edge, key: string) => {
      if (component.owner) {
        occupiedComponents.push({ id: key, color: component.color });
      }
    });
  }

  getOccupiedVertices(): object[] {
    const vertices: Components[] = [];
    this.extractOccupiedComponents(this.board.vertices, vertices);
    return vertices;
  }

  getOccupiedEdges(): object[] {
    const edges: Components[] = [];
    this.extractOccupiedComponents(this.board.edges, edges);
    return edges;
  }

  getGameData(playerId: string): object {
    const vertices = this.getOccupiedVertices();
    const edges = this.getOccupiedEdges();
    const diceRoll = this.diceRoll;
    const players = this.getPlayersInfo(playerId);
    const currentPlayer = this.players[this.currentPlayerIndex].name;
    return { vertices, edges, diceRoll, players, currentPlayer };
  }

  private hasConnectedRoad(vertexId: string): boolean {
    const vtx = this.getVertex(vertexId);
    const adjacentEdges = vtx?.connectedEdges || [];
    const currentPlayerId = this.getCurrentPlayer().id;

    return [...adjacentEdges].some(
      (edge: string) => this.getEdge(edge)?.owner === currentPlayerId,
      (edge: string) => this.getEdge(edge)?.owner === currentPlayerId,
    );
  }

  private canBuildSettlement(vertexId: string): boolean {
    return this.setupValidation(vertexId) && this.hasConnectedRoad(vertexId);
  }

  validateBuildSettlement(vertexId: string, playerId: string): boolean {
    if (!this.isCurrentPlayer(playerId)) return false;
    if (this.isInitialSetup()) return this.canBuildInitialSettlement(vertexId);

    return this.canBuildSettlement(vertexId);
  }

  validateBuildRoad(edgeId: string, playerId: string): boolean {
    if (!this.isCurrentPlayer(playerId)) return false;
    if (this.isInitialSetup()) return this.canBuildInitialRoad(edgeId);

    return this.canBuildRoad(edgeId);
  }
}
