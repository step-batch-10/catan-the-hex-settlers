import _ from 'lodash';
import { Board } from './board.ts';
import { Player } from './player.ts';
import { Vertex } from './vertex.ts';
import { Edge } from './edge.ts';
import type {
  BuildType,
  Components,
  DevCardTypes,
  DevelopmentCards,
  DistributeResourceData,
  GameData,
  GamePhase,
  GameState,
  Phase,
  PlayerAssets,
  PlayersList,
  ResourceProduction,
  Resources,
  RollDice,
  SpecialCardOwners,
  StringSet,
  Supply,
} from '../types.ts';
import { TradeManager } from './trade.ts';
import { Notification } from './notification.ts';

export class Catan {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number; //private
  phase: GamePhase;
  winner: string | null;
  diceRoll: [number, number] | [];
  board: Board;
  turns: number;
  diceFn: RollDice;
  roadBuilding: {
    shouldBuild: boolean;
    count: number;
  };

  private static playerAssets = {
    road: { brick: 1, lumber: 1 },
    settlement: { brick: 1, lumber: 1, grain: 1, wool: 1 },
    city: { grain: 2, ore: 3 },
    devCard: { ore: 1, grain: 1, wool: 1 },
  };
  turn: { hasRolled: boolean };
  largestArmyCount: number;
  longestRoadCount: number;
  specialCardOwners: SpecialCardOwners;
  supply: Supply;
  noPreAction: boolean;
  trades: TradeManager;
  notifications: Notification;

  constructor(
    gameId: string,
    players: Player[],
    board: Board,
    diceFn: (start?: number, end?: number) => number,
    supply: Supply,
    trades: TradeManager,
    notifications: Notification,
  ) {
    this.gameId = gameId;
    this.players = players;
    this.currentPlayerIndex = 0;
    this.phase = 'setup';
    this.winner = null;
    this.noPreAction = true;
    this.diceRoll = [1, 1];
    this.diceFn = diceFn;
    this.board = board;
    this.turns = 0;
    this.turn = { hasRolled: false };
    this.supply = supply;
    this.largestArmyCount = 2;
    this.longestRoadCount = 4;
    this.specialCardOwners = { largestArmy: null, longestRoad: null };
    this.roadBuilding = {
      shouldBuild: false,
      count: 2,
    };
    this.trades = trades;
    this.notifications = notifications;
  }

  changePhaseToMain(): void {
    this.phase = 'main';
    this.currentPlayerIndex = 0;
  }

  reverseOrder(): void {
    if (this.turns === 8) this.currentPlayerIndex = 4;
    this.currentPlayerIndex--;
  }

  private arePlacingSecondSettlement() {
    return this.turns >= 8 && this.turns < 16;
  }

  changeTurn(): void {
    if (this.turns === 16) this.changePhaseToMain();

    if (this.arePlacingSecondSettlement()) return this.reverseOrder();
    if (!this.isInitialSetup() && !this.turn.hasRolled) return;
    this.turn = { hasRolled: false };
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  private canProduce(hexId: string, rolledNumber: number): boolean {
    const { hexes } = this.board;
    const hex = hexes.get(hexId);
    const isProducingTerrain = hex?.terrainNumber === rolledNumber;
    const hasRobber = hex?.hasRobber;

    return isProducingTerrain && !hasRobber;
  }

  private getProducedResources(
    terrains: string[] | undefined,
    rolledNumber: number,
  ) {
    const { hexes } = this.board;
    const producedTerrains = terrains?.filter((hexId) =>
      this.canProduce(hexId, rolledNumber)
    );

    return producedTerrains?.map((terrain) => hexes.get(terrain)?.resource);
  }

  private addProducedResource(
    playerId: string,
    resource: keyof Resources | undefined,
    buildingType: string,
  ) {
    return { playerId, resource, buildingType };
  }

  private addProducedResources(
    resources: ResourceProduction,
    resourcesProduced: object[],
    player: Player,
    buildingType: 'settlement' | 'city',
  ) {
    resources?.forEach((resource) =>
      resourcesProduced.push(
        this.addProducedResource(player.id, resource, buildingType),
      )
    );
  }

  private resourcesForSettlement(player: Player, rolledNumber: number) {
    const resourcesProduced: DistributeResourceData[] = [];
    player.settlements.forEach((settlement) => {
      const terrains = this.board.vertices.get(settlement)?.adjacentHexes;
      const resources = this.getProducedResources(terrains, rolledNumber);
      this.addProducedResources(
        resources,
        resourcesProduced,
        player,
        'settlement',
      );
    });
    player.cities.forEach((city) => {
      const terrains = this.board.vertices.get(city)?.adjacentHexes;
      const resources = this.getProducedResources(terrains, rolledNumber);
      this.addProducedResources(resources, resourcesProduced, player, 'city');
    });

    return resourcesProduced;
  }

  private toBeDistributed(rolledNumber: number): DistributeResourceData[] {
    const resourcesProduced: DistributeResourceData[] = [];

    this.players.forEach((player) => {
      const settlements = this.resourcesForSettlement(player, rolledNumber);
      resourcesProduced.push(...settlements);
    });

    return resourcesProduced;
  }

  updateResource(resourceData: DistributeResourceData) {
    const { playerId, resource, buildingType } = resourceData;
    const player = _.find(this.players, { id: playerId });
    const count = buildingType === 'city' ? 2 : 1;
    player.addResource(resource, count);
    this.supply.resources[resource] -= count;
  }

  distributeResources(resourcesToBeDistributed: DistributeResourceData[]) {
    resourcesToBeDistributed.forEach((resourceData) =>
      this.updateResource(resourceData)
    );
  }

  distributeResourcesForDiceRoll(): void {
    const rolledNumber = this.diceRoll.reduce((sum, a) => sum + a, 0);
    const needToDistributed = this.toBeDistributed(rolledNumber);
    this.distributeResources(needToDistributed);
  }

  rollDice(): object {
    const dice1Value = this.diceFn(1, 6);
    const dice2Value = this.diceFn(1, 6);
    this.diceRoll = [dice1Value, dice2Value];
    const isRobber = dice1Value + dice2Value === 7;
    this.noPreAction = !isRobber;
    this.turns++;
    this.turn.hasRolled = true;
    this.distributeResourcesForDiceRoll();

    return { rolled: this.diceRoll, isRobber };
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

  private hasAlreadyRolled() {
    return this.turn.hasRolled;
  }

  canRoll(playerId: string): boolean {
    return (
      this.isCurrentPlayer(playerId) &&
      !this.isInitialSetup() &&
      !this.hasAlreadyRolled()
    );
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
    );
  }

  private hasOwnedAdjacentRoad(edgeId: string) {
    const edge = this.getEdge(edgeId);
    const adjacentVertexIds = edge?.vertices || [];

    return [...adjacentVertexIds].some((vtxId) => this.hasConnectedRoad(vtxId));
  }

  private hasEnoughResources(structure: PlayerAssets) {
    const playerResources = this.getCurrentPlayer().resources;

    for (const [res, count] of _.entries(Catan.playerAssets[structure])) {
      if (playerResources[res] < count) return false;
    }

    return true;
  }

  private hasDevCards() {
    const totalCards = this.supply.devCards.length;
    return totalCards > 0;
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

  private deductResources(asset: PlayerAssets) {
    if (!this.hasEnoughResources(asset)) {
      throw new Error("You don't have enough resources");
    }

    const playerResources = this.getCurrentPlayer().resources;

    for (const [res, count] of _.entries(Catan.playerAssets[asset])) {
      playerResources[res] -= count;
    }

    return playerResources;
  }

  updateRoadBuilding(): boolean {
    this.roadBuilding.count--;
    if (this.roadBuilding.count === 0) {
      this.noPreAction = true;
      this.roadBuilding.shouldBuild = false;
      this.roadBuilding.count = 2;
    }
    return true;
  }

  buildRoad(edgeId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    this.getEdge(edgeId)?.occupy(currentPlayer.id, currentPlayer.color);
    currentPlayer.addRoad(edgeId);
    this.handleRoad(currentPlayer);
    this.turns++;
    if (this.roadBuilding.shouldBuild) return this.updateRoadBuilding();
    this.isInitialSetup() ? this.changeTurn() : this.deductResources('road');

    return true;
  }

  private handleRoad(currentPlayer: Player) {
    const longestRoadLength = this.longestRoadOf(currentPlayer.id);
    currentPlayer.updateLongestRoad(longestRoadLength);
    if (longestRoadLength > this.longestRoadCount) {
      this.longestRoadCount = longestRoadLength;
      this.handleSpecialCard('longestRoad');
    }
  }

  validateBuyDevCard(playerId: string) {
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('You are not the current player');
    }

    if (!this.hasAlreadyRolled()) {
      throw new Error("You haven't rolled the dice");
    }

    if (!this.hasDevCards()) {
      throw new Error('The development card Deck is empty');
    }
  }

  private updatePlayerDevCards(randomCard: DevelopmentCards) {
    const developmentCards = this.getCurrentPlayer().devCards.owned;
    developmentCards[randomCard] += 1;
  }

  buyDevCard(playerId: string) {
    try {
      this.validateBuyDevCard(playerId);
      this.deductResources('devCard');
      const topCard = this.supply.devCards.shift();
      if (topCard) this.updatePlayerDevCards(topCard);

      return { isSucceed: true, result: topCard, message: '' };
    } catch (e) {
      const error = e as Error;
      return { isSucceed: false, result: '', message: error.message };
    }
  }

  distributeInitialResources(
    vertexId: string,
    player: Player,
    count: number,
  ): void {
    const hexes = this.getVertex(vertexId)?.adjacentHexes;
    const resources = hexes?.map(
      (hexId) => this.board.hexes.get(hexId)?.resource,
    );

    resources?.forEach((resource) => {
      if (resource) player.addResource(resource, count);
    });
  }

  buildSettlement(vertexId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (this.getVertex(vertexId)?.isOccupied()) {
      this.deductResources('city');
      return this.buildCity(vertexId);
    }

    this.getVertex(vertexId)?.occupy(currentPlayer.id, currentPlayer.color);
    currentPlayer.settlements.push(vertexId);

    if (currentPlayer.settlements.length === 2) {
      this.distributeInitialResources(vertexId, currentPlayer, 1);
    }

    if (!this.isInitialSetup()) this.deductResources('settlement');
    currentPlayer.victoryPoints += 1;
    this.turns++;

    return true;
  }

  abstractPlayerData(player: Player): object {
    const data = player.getPlayerData();
    const resources = _.sum(_.values(data.resources));
    const devCards = _.sum(_.values(data.devCards.owned));

    return { ...data, resources, devCards };
  }

  getResults() {
    const results = this.players.map((player) => {
      const playerData = this.abstractPlayerData(player);
      const victoryPoints = player.calculatePlayerPoints();

      return { ...playerData, victoryPoints };
    });

    return _.reverse(_.sortBy(results, 'victoryPoints'));
  }

  getPlayersInfo(playerId: string): PlayersList {
    const [[player], _others] = _.partition(
      this.players,
      (p: Player) => p.id === playerId,
    );

    const me = player.getPlayerData();
    const playersInfo = this.players.map((other: Player) =>
      this.abstractPlayerData(other)
    );

    return { me, playersInfo };
  }

  getAvailableActions(playerId: string): {
    canTrade: boolean;
    canRoll: boolean;
  } {
    const isPlayerTurnInMainPhase = this.isCurrentPlayer(playerId) &&
      !this.isInitialSetup();
    const canRoll = isPlayerTurnInMainPhase && !this.hasAlreadyRolled();
    const canTrade = isPlayerTurnInMainPhase && this.hasAlreadyRolled() &&
      this.noPreAction;

    return { canTrade, canRoll };
  }

  private isDesert(hexId: string) {
    return this.board.hexes.get(hexId)?.terrain === 'desert';
  }

  validateRobberPosition(hexId: string): boolean {
    const isSameHex = this.board.robberPosition === hexId;
    const isDesert = this.isDesert(hexId);
    const isHex = this.board.hexes.has(hexId);

    return !(isSameHex || isDesert) && isHex;
  }

  blockResource(hexId: string) {
    const hex = this.board.updateRobber(hexId);
    this.noPreAction = true;

    return { hex };
  }

  getGameState(playerId: string): GameState {
    const players = this.getPlayersInfo(playerId);

    const board = this.board.getBoard();
    const currentPlayerId = this.getCurrentPlayer().id;
    const { gameId, diceRoll } = this;
    const gamePhase = this.phase;
    const availableActions = this.getAvailableActions(playerId);

    const playersData = { playerId, players, currentPlayerId };
    return {
      gameId,
      diceRoll,
      board,
      gamePhase,
      availableActions,
      ...playersData,
    };
  }

  private extractOccupiedComponents(
    componentsMap: Map<string, Vertex | Edge>,
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

  hasWon() {
    return this.getCurrentPlayer().hasWon();
  }

  private getOccupiedCities(vertices: string[]): object[] {
    const settlemets: Components[] = [];
    const vtxs: Vertex[] = vertices.map(
      (vtx) => this.getVertex(vtx) || new Vertex(vtx, null),
    );

    vtxs.forEach((vtx) => {
      if (vtx.owner) {
        settlemets.push({ id: vtx.id, color: vtx.color });
      }
    });

    return settlemets;
  }

  private allCities(): string[] {
    const cities: string[] = [];
    this.players.forEach((player) => {
      player.cities.forEach((city) => cities.push(city));
    });

    return cities;
  }

  getGameData(playerId: string): GameData {
    const vertices = this.getOccupiedVertices();
    const edges = this.getOccupiedEdges();
    const cities = this.getOccupiedCities(this.allCities());
    const diceRoll = this.diceRoll;
    const players = this.getPlayersInfo(playerId);
    const currentPlayer = this.players[this.currentPlayerIndex].name;
    const availableActions = this.getAvailableActions(playerId);
    const gamePhase = this.phase;
    const currentPlayerId = this.getCurrentPlayer().id;
    const hasWon = this.hasWon();
    const notifications = this.notifications.getNewNotifications();

    return {
      hasWon,
      cities,
      vertices,
      edges,
      diceRoll,
      players,
      currentPlayer,
      gamePhase,
      currentPlayerId,
      availableActions,
      notifications,
    };
  }

  private hasConnectedRoad(vertexId: string): boolean {
    const vtx = this.getVertex(vertexId);
    const adjacentEdges = vtx?.connectedEdges || [];
    const currentPlayerId = this.getCurrentPlayer().id;

    return [...adjacentEdges].some(
      (edge: string) => this.getEdge(edge)?.owner === currentPlayerId,
    );
  }

  private canBuildSettlement(vertexId: string): boolean {
    if (this.isVertexOccupied(vertexId)) return this.canBuildCity(vertexId);
    return (
      this.setupValidation(vertexId) &&
      this.hasConnectedRoad(vertexId) &&
      this.hasEnoughResources('settlement')
    );
  }

  validateBuildSettlement(vertexId: string, playerId: string): boolean {
    if (!this.isCurrentPlayer(playerId)) return false;
    if (this.isInitialSetup()) return this.canBuildInitialSettlement(vertexId);

    return this.turn.hasRolled && this.canBuildSettlement(vertexId);
  }

  validateBuildRoad(edgeId: string, playerId: string): boolean {
    if (!this.isCurrentPlayer(playerId)) return false;
    if (this.roadBuilding.shouldBuild) return this.canBuildRoad(edgeId);
    if (this.isInitialSetup()) return this.canBuildInitialRoad(edgeId);

    return (
      this.turn.hasRolled &&
      this.canBuildRoad(edgeId) &&
      this.hasEnoughResources('road')
    );
  }

  private handleSpecialCard(cardType: keyof SpecialCardOwners) {
    const player = this.getCurrentPlayer();
    const oldHolderIndex = this.specialCardOwners[cardType];
    if (oldHolderIndex !== null) {
      this.players[oldHolderIndex].deductSpecialCard(cardType);
    }
    this.updateCardInfo(player, cardType);
  }

  private updateCardInfo(player: Player, cardType: keyof SpecialCardOwners) {
    player.addSpecialCard(cardType);
    this.largestArmyCount = player.devCards.played.knight;
    this.specialCardOwners[cardType] = this.currentPlayerIndex;
  }

  playDevCard(cardType: keyof DevCardTypes): void {
    const player = this.getCurrentPlayer();
    player.playDevCard(cardType);
    if (player.devCards.played.knight > this.largestArmyCount) {
      this.handleSpecialCard('largestArmy');
    }
  }

  private isInitialSettlementTurn(): boolean {
    return this.turns % 2 === 0;
  }

  private isInitialRoadTurn(): boolean {
    return this.turns % 2 === 1;
  }

  private isPlacingInitial(type: BuildType): boolean {
    if (!this.isInitialSetup()) return false;

    return type === 'settlement'
      ? this.isInitialSettlementTurn()
      : this.isInitialRoadTurn();
  }

  canBuildCity(vertexId: string) {
    return (
      this.getCurrentPlayer().settlements.includes(vertexId) &&
      this.hasEnoughResources('city')
    );
  }

  buildCity(vertexId: string): boolean {
    const currentPlayer = this.getCurrentPlayer();
    currentPlayer.addCity(vertexId);
    currentPlayer.victoryPoints += 1;

    return true;
  }

  private isCity(type: string) {
    return (
      type === 'city' && this.turn.hasRolled && this.hasEnoughResources('city')
    );
  }

  allPossibleRoads(edgeId: string): boolean {
    return this.canBuildRoad(edgeId);
  }

  getAvailableLocations(
    type: BuildType,
    phase: Phase,
    playerId: string,
  ): StringSet {
    if (this.isCity(type)) {
      return new Set([...this.getCurrentPlayer().settlements]);
    }

    const builds = type === 'settlement'
      ? this.board.vertices
      : this.board.edges;

    const conditionMap = {
      settlement: {
        initial: this.canBuildInitialSettlement.bind(this),
        main: this.canBuildSettlement.bind(this),
        roadBuilding: () => null,
      },
      road: {
        roadBuilding: this.allPossibleRoads.bind(this),
        initial: this.canBuildInitialRoad.bind(this),
        main: this.validateBuildRoad.bind(this),
      },
      city: { main: () => null, initial: () => null, roadBuilding: () => null },
    };

    const isValid = conditionMap[type][phase];
    const available: StringSet = new Set();

    builds.forEach((_, key) => {
      if (isValid(key, playerId)) available.add(key);
    });

    return available;
  }

  private createMapOfPieces(
    roads: StringSet,
    settlement: StringSet,
    cities: StringSet,
  ): Map<string, StringSet> {
    return new Map([
      ['settlements', settlement],
      ['roads', roads],
      ['cities', cities],
    ]);
  }

  getAvailableBuilds(id: string): Map<string, StringSet> {
    if (this.isCurrentPlayer(id) && this.roadBuilding.shouldBuild) {
      const initRoads = this.getAvailableLocations('road', 'roadBuilding', id);
      return this.createMapOfPieces(initRoads, new Set(), new Set());
    }

    if (!this.isCurrentPlayer(id) || !this.noPreAction) {
      return this.createMapOfPieces(new Set(), new Set(), new Set());
    }

    if (this.isPlacingInitial('settlement')) {
      const settels = this.getAvailableLocations('settlement', 'initial', id);
      return this.createMapOfPieces(new Set(), settels, new Set());
    }

    if (this.isPlacingInitial('road')) {
      const initRoads = this.getAvailableLocations('road', 'initial', id);
      return this.createMapOfPieces(initRoads, new Set(), new Set());
    }

    if (!this.hasAlreadyRolled()) {
      return this.createMapOfPieces(new Set(), new Set(), new Set());
    }

    const cities = this.getAvailableLocations('city', 'main', id);
    const settlements = this.getAvailableLocations('settlement', 'main', id);
    const roads = this.getAvailableLocations('road', 'main', id);

    return this.createMapOfPieces(roads, settlements, cities);
  }

  private dfs(
    playerId: string,
    vertexId: string,
    length: number,
    visitedEdges: Set<string>,
  ): number {
    const vertex = this.getVertex(vertexId);
    if (!vertex) return length;

    const adjacentEdges = vertex.connectedEdges || [];
    let maxLength = length;

    for (const edgeId of adjacentEdges) {
      const edge = this.getEdge(edgeId);
      if (!edge || edge.owner !== playerId || visitedEdges.has(edgeId)) {
        continue;
      }

      visitedEdges.add(edgeId);

      const [v1, v2] = edge.vertices;
      const nextVertexId = v1 === vertexId ? v2 : v1;

      maxLength = Math.max(
        maxLength,
        this.dfs(playerId, nextVertexId, length + 1, visitedEdges),
      );

      visitedEdges.delete(edgeId);
    }

    return maxLength;
  }

  longestRoadOf(playerId: string): number {
    const player: Player = _.find(this.players, { id: playerId });
    const visitedEdges = new Set<string>();
    let longestRoad = 0;

    player.roads.forEach((edgeId) => {
      const edge: Edge = this.board.edges.get(edgeId) ||
        new Edge('e1', ['', '']);
      if (!visitedEdges.has(edgeId)) {
        const [v1, v2] = edge.vertices;
        visitedEdges.add(edgeId);
        longestRoad = Math.max(
          longestRoad,
          this.dfs(playerId, v1, 1, visitedEdges),
          this.dfs(playerId, v2, 1, visitedEdges),
        );
        visitedEdges.delete(edgeId);
      }
    });

    return longestRoad;
  }

  private deductResourceOfType(players: Player[], resource: keyof Resources) {
    return players.reduce((total, player) => {
      const count = player.resources[resource];
      player.dropCard(resource, count);
      return total + count;
    }, 0);
  }

  playMonopoly(resource: keyof Resources) {
    const player = this.getCurrentPlayer();
    const others = this.players.filter((_, i) => i !== this.currentPlayerIndex);
    const count = this.deductResourceOfType(others, resource);
    player.addResource(resource, count);
    player.playDevCard('monopoly');
  }

  playRoadBuilding() {
    const player = this.getCurrentPlayer();
    this.roadBuilding.shouldBuild = true;
    this.noPreAction = false;
    player.playDevCard('road-building');
  }
}
