import { Board } from './board.ts';
import { Player } from './player.ts';
import _ from 'lodash';
import { Vertex } from './vertex.ts';
import { Edge } from './edge.ts';

type GamePhase = 'rolling' | 'setup' | 'main' | 'end';

interface EdgeData {
  id: string;
  owner: string | null;
}

interface VertexData {
  id: string;
  owner: string | null;
  harbor: string | null;
  adjacentHexes: string[];
}

export class Catan {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  winner: string | null;
  diceRoll: [number, number] | [];
  board: Board;
  turns: number;

  constructor() {
    this.gameId = 'game123';
    this.players = [];
    this.currentPlayerIndex = 0;
    this.phase = 'setup';
    this.winner = null;
    this.diceRoll = [1, 1];
    this.board = new Board();
    this.turns = 0;
  }

  mockGame(): this {
    this.players.push(new Player('p1', 'Adil', 'red'));
    this.players.push(new Player('p2', 'Aman', 'blue'));
    this.players.push(new Player('p3', 'Vineet', 'orange'));
    this.players.push(new Player('p4', 'Shalu', 'white'));
    this.board.createBoard();
    return this;
  }

  changePhase(): void {
    if (this.turns === 16) this.phase = 'main';
  }

  reverseOrder(): void {
    if (this.turns === 8) this.currentPlayerIndex = 4;
    this.currentPlayerIndex--;
  }

  changeTurn(): void {
    this.changePhase();

    if (this.turns >= 8 && this.turns < 16) return this.reverseOrder();
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  rollDice(): [number, number] {
    const dice1 = _.random(1, 6);
    const dice2 = _.random(1, 6);
    this.diceRoll = [dice1, dice2];
    this.turns++;
    this.changeTurn();
    return this.diceRoll;
  }

  isInitialSetup(): boolean {
    return this.phase === 'setup';
  }

  canRoll(playerId: string): boolean {
    return (
      !this.isInitialSetup() &&
      this.players[this.currentPlayerIndex].id === playerId
    );
  }

  private isVertexOccupied(vertexId: string) {
    return this.board.vertices.get(vertexId)?.isOccupied();
  }

  private isVertexValid(vertexId: string) {
    return this.board.vertices.has(vertexId);
  }

  private isDistanceRuleFollowed(vertexId: string) {
    const vertices = this.board.vertices;
    const vertex = vertices.get(vertexId);
    const adjacentVtx = vertex?.connectedVertices || [];

    return [...adjacentVtx].every((vtx) => !vertices.get(vtx)?.isOccupied());
  }

  private setupValidation(vertexId: string): boolean {
    return (
      this.isVertexValid(vertexId) &&
      !this.isVertexOccupied(vertexId) &&
      this.isDistanceRuleFollowed(vertexId)
    );
  }

  private hasConnectedSettlement(edgeId: string): boolean {
    const edge = this.board.edges.get(edgeId);
    const vertices = this.board.vertices;
    const currentPlayerId = this.players[this.currentPlayerIndex].id;
    const adjacentVertexIds = edge?.vertices || [];

    return [...adjacentVertexIds].some(
      (vtxId: string) => vertices.get(vtxId)?.owner === currentPlayerId,
    );
  }

  private hasOwnedAdjacentRoad(edgeId: string) {
    const edge = this.board.edges.get(edgeId);
    const adjacentVertexIds = edge?.vertices || [];

    return [...adjacentVertexIds].some((vtxId) => this.hasConnectedRoad(vtxId));
  }

  private canBuildRoad(edge: string) {
    const edges = this.board.edges;
    const isRoadOccupied = edges.get(edge)?.isOccupied();
    const hasConnectedSettlement = this.hasConnectedSettlement(edge);
    const hasConnectedRoad = this.hasOwnedAdjacentRoad(edge);

    return !isRoadOccupied && (hasConnectedSettlement || hasConnectedRoad);
  }

  canBuildInitialSettlement(settlementId: string): boolean {
    return this.turns % 2 === 0 && this.setupValidation(settlementId);
  }

  canBuildInitialRoad(roadId: string): boolean {
    return this.turns % 2 === 1 && this.canBuildRoad(roadId);
  }

  buildRoad(edgeId: string): boolean {
    const currentPlayer = this.players[this.currentPlayerIndex];
    this.board.edges.get(edgeId)?.occupy(currentPlayer.id, currentPlayer.color);
    currentPlayer.roads.push(edgeId);
    this.turns++;
    this.changeTurn();

    return true;
  }

  distributeResources(vertexId: string, player: Player, count: number): void {
    const hexes = this.board.vertices.get(vertexId)?.adjacentHexes;
    const resources = hexes?.map((hex) => this.board.hexes.get(hex)?.resource);

    resources?.forEach((resource) => {
      if (resource) player.addResource(resource, count);
    });
  }

  buildSettlement(vertexId: string): boolean {
    const currentPlayer = this.players[this.currentPlayerIndex];
    this.board.vertices
      .get(vertexId)
      ?.occupy(currentPlayer.id, currentPlayer.color);
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

  getPlayersInfo(playerId: string): {
    me: ReturnType<Player['getPlayerData']>;
    others: object[];
  } {
    const [[player], others] = _.partition(
      this.players,
      (p: Player) => p.id === playerId,
    );

    const me = player.getPlayerData();
    const othersData = others.map((other: Player) =>
      this.abstractPlayerData(other)
    );
    return { me, others: othersData };
  }

  getAvailableActions(playerId: string) {
    const canRoll = this.players[this.currentPlayerIndex].id === playerId &&
      !this.isInitialSetup();
    return { canRoll };
  }

  getGameState(playerId: string): {
    gameId: string;
    diceRoll: number[];
    board: { hexes: object[]; vertices: VertexData[]; edges: EdgeData[] };
    availableActions: { canRoll: boolean };
  } {
    const players = this.getPlayersInfo(playerId);
    const board = this.board.getBoard();
    const currentPlayerId = this.players[this.currentPlayerIndex].id;
    const { gameId, diceRoll } = this;
    const availableActions = this.getAvailableActions(playerId);

    const playersData = { playerId, players, currentPlayerId };
    return { gameId, diceRoll, board, availableActions, ...playersData };
  }

  getOccupiedVertices(): object[] {
    const vertices: object[] = [];
    this.board.vertices.forEach((vertex: Vertex, key: string) => {
      if (vertex.owner) {
        vertices.push({ id: key, color: vertex.color });
      }
    });

    return vertices;
  }

  getOccupiedEdges(): object[] {
    const edges: object[] = [];
    this.board.edges.forEach((edge: Edge, key: string) => {
      if (edge.owner) edges.push({ id: key, color: edge.color });
    });

    return edges;
  }

  getGameData(): object {
    const vertices = this.getOccupiedVertices();
    const edges = this.getOccupiedEdges();
    const diceRoll = this.diceRoll;

    return { vertices, edges, diceRoll };
  }

  private hasConnectedRoad(vertexId: string): boolean {
    const vtx = this.board.vertices.get(vertexId);
    const edges = this.board.edges;
    const adjacentEdges = vtx?.connectedEdges || [];
    const currentPlayerId = this.players[this.currentPlayerIndex].id;

    return [...adjacentEdges].some(
      (edge: string) => edges.get(edge)?.owner === currentPlayerId,
    );
  }

  private mainValidation(vertexId: string): boolean {
    return this.setupValidation(vertexId) && this.hasConnectedRoad(vertexId);
  }

  validateBuildSettlement(vertexId: string, playerId: string): boolean {
    if (this.players[this.currentPlayerIndex].id !== playerId) return false;
    if (this.phase === 'setup') return this.canBuildInitialSettlement(vertexId);

    return this.mainValidation(vertexId);
  }

  validateBuildRoad(edgeId: string, playerId: string): boolean {
    if (this.players[this.currentPlayerIndex].id !== playerId) return false;
    if (this.phase === 'setup') return this.canBuildInitialRoad(edgeId);

    return this.canBuildRoad(edgeId);
  }
}
