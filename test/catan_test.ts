import _ from 'lodash';
import { Vertex } from '../src/models/vertex.ts';
import { assertEquals, assert, assertFalse } from 'assert';
import { describe, it, beforeEach } from 'testing/bdd';
import type {
  VertexData,
  EdgeData,
  Resources,
  DevelopmentCards,
  NotificationMessage,
} from '../src/types.ts';
import { Catan } from '../src/models/catan.ts';
import { Player } from '../src/models/player.ts';
import { Board } from '../src/models/board.ts';
import { defaultResources } from '../src/types.ts';
import { Edge } from '../src/models/edge.ts';
import { TradeManager } from '../src/models/trade.ts';
import { Notification } from '../src/models/notification.ts';

describe('Catan', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();

    const supply: { resources: Resources; devCards: DevelopmentCards[] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should initialize the game correctly', () => {
    assertEquals(catan.gameId, 'game123');
    assertEquals(catan.players.length, 4);
    assertEquals(catan.phase, 'setup');
    assertEquals(catan.currentPlayerIndex, 0);
    assertEquals(catan.turns, 0);
    assertEquals(catan.diceRoll.length, 2);
  });

  it('should roll the dice correctly', () => {
    catan.diceFn = () => 5;
    const diceRoll = catan.rollDice();

    assertEquals(diceRoll, { isRobber: false, rolled: [5, 5] });
    assertEquals(catan.turns, 1);
  });

  it('should change the turn correctly', () => {
    catan.turns = 17;
    catan.turn.hasRolled = true;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 1);

    catan.turn.hasRolled = true;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 2);
  });

  it('should check if player can roll', () => {
    const player1 = catan.players[0];
    const canRoll = catan.canRoll(player1.id);

    catan.phase = 'setup';
    const cannotRoll = catan.canRoll(player1.id);

    assertFalse(canRoll);
    assertFalse(cannotRoll);
  });

  it('should allow players to build settlements on the correct turns', () => {
    const canBuildSettlement =
      catan.canBuildInitialSettlement('v0,-1|0,0|1,-1');

    catan.turns = 1;
    const cannotBuildSettlement = catan.canBuildInitialSettlement('v1');

    assert(canBuildSettlement);
    assertFalse(cannotBuildSettlement);
  });

  it('should allow players to build roads on the correct turns', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId1 = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';
    catan.buildSettlement(settlementId);
    catan.turns = 0;
    const canBuildRoad = catan.canBuildInitialRoad(roadId1);

    catan.turns = 1;
    const canBuildRoadNow = catan.canBuildInitialRoad(roadId1);

    assertFalse(canBuildRoad);
    assertEquals(canBuildRoadNow, true);
  });

  it('should build a road correctly', () => {
    const edgeId = 'e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2';
    const gameState = catan.getGameState('p1');
    gameState.players.me.resources.brick = 1;
    gameState.players.me.resources.lumber = 1;
    const result = catan.buildRoad(edgeId);
    const edges = catan.getOccupiedEdges();

    assert(result);
    assertEquals(edges, [
      { id: 'e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2', color: 'red' },
    ]);
  });

  it('should build a settlement correctly', () => {
    const vertexId = 'v1_1';
    const result = catan.buildSettlement(vertexId);

    assert(result);
  });

  it('should provide game state correctly', () => {
    const player1 = catan.players[0];
    catan.turn.hasRolled = true;
    const gameState: {
      gameId: string;
      diceRoll: number[];
      board: { hexes: object[]; vertices: VertexData[]; edges: EdgeData[] };
    } = catan.getGameState(player1.id);

    assertEquals(gameState.gameId, 'game123');
    assert(gameState.diceRoll.length === 2, 'Dice roll should be present.');
    assert(gameState.board.hexes.length > 0, 'Board hexes should be present.');
    assert(
      gameState.board.vertices.length > 0,
      'Board vertices should be present.',
    );
    assert(gameState.board.edges.length > 0, 'Board edges should be present.');
  });

  it('should correctly change the game phase from setup to main', () => {
    catan.changePhaseToMain();

    assertEquals(catan.phase, 'main');
  });

  it('should reverse turn order correctly after turn 8', () => {
    catan.turns = 8;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);

    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);

    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);
  });

  it('should distribute resources when a settlement is built', () => {
    const vertexId = 'v0,0|1,-1|1,0';
    const player = catan.players[catan.currentPlayerIndex];
    player.settlements.push('');

    const initialResourceCount = player.resources.brick;
    catan.buildSettlement(vertexId);

    const newResourceCount = player.resources.brick;
    const vertices = catan.getOccupiedVertices();

    assert(
      newResourceCount > initialResourceCount,
      'Player should receive resources after building a settlement.',
    );
    assertEquals(vertices, [{ id: 'v0,0|1,-1|1,0', color: 'red' }]);
  });

  it('should change the phase to main', () => {
    catan.turns = 16;
    catan.changePhaseToMain();

    assertEquals(catan.phase, 'main');
  });

  it('should be able to roll', () => {
    catan.turns = 16;
    catan.changePhaseToMain();

    assertEquals(catan.phase, 'main');
    catan.changeTurn();
    catan.players[0] = new Player('p1', 'Adil', 'red');
    catan.currentPlayerIndex = 0;
    const canRoll = catan.canRoll('p1');
    assert(canRoll);
  });

  it('should not trade in setup phase', () => {
    const availableActions = catan.getAvailableActions('p1');

    assertFalse(availableActions.canTrade);
  });

  it('should not trade in main phase', () => {
    catan.phase = 'main';
    const availableActions = catan.getAvailableActions('p1');

    assertFalse(availableActions.canTrade);
  });

  it('should not trade if not current player in main phase', () => {
    catan.phase = 'main';
    const availableActions = catan.getAvailableActions('p2');

    assertFalse(availableActions.canTrade);
  });

  it("should not trade if current player in main phase and hasn't rolled the dice", () => {
    catan.phase = 'main';
    catan.turn.hasRolled = false;
    const availableActions = catan.getAvailableActions('p2');

    assertFalse(availableActions.canTrade);
  });

  it('should  trade if current player in main phase and has rolled the dice', () => {
    catan.phase = 'main';
    catan.turn.hasRolled = true;
    const availableActions = catan.getAvailableActions('p1');

    assert(availableActions.canTrade);
  });

  it('should block resource if valid hex', () => {
    const hexId = 'h0_1';
    const { hex } = catan.blockResource(hexId);

    assert(catan.board.hexes.get(hexId)?.hasRobber);
    assertEquals(catan.board.robberPosition, hexId);
    assertEquals(hex, hexId);
  });

  it('should be true if robber placement is in different hex', () => {
    const canPlace = catan.validateRobberPosition('h0_1');
    assert(canPlace);
  });

  it('should be false if robber placement is in same hex', () => {
    const canPlace = catan.validateRobberPosition('h0_2');
    assertFalse(canPlace);
  });

  it('should be true if player points equal or more than 10', () => {
    catan.players[0].victoryPoints = 10;
    const hasWon = catan.players[0].hasWon();
    assert(hasWon);
  });

  it('should be true if player points equal or more than 10', () => {
    const hasWon = catan.players[0].hasWon();
    assertFalse(hasWon);
  });

  it('should be true if player points equal or more than 10', () => {
    const player = catan.players[0];
    player.victoryPoints = 10;
    player.hasLargestArmy = true;
    player.hasLongestRoad = true;
    const hasWon = catan.players[0].hasWon();
    assert(hasWon);
  });

  it('should results of all the players', () => {
    const results = catan.getResults();
    assertEquals(results.length, 4);
    assertEquals(results[0].name, 'Shalu');
  });
});

describe('buildSettlement ', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();

    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should build the settlement for setup mode', () => {
    const playerId = 'p1';
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.players[0].addResource('brick', 5);
    catan.players[0].addResource('wool', 5);
    catan.players[0].addResource('grain', 5);
    catan.players[0].addResource('ore', 5);
    catan.players[0].addResource('lumber', 5);

    const hasBuilt = catan.buildSettlement(settlementId);
    const settlement = catan.board.vertices.get(settlementId);

    assert(hasBuilt);
    assertEquals(settlement?.occupiedBy(), playerId);
    assert(settlement?.isOccupied);
  });

  it('should build the city for main mode', () => {
    const playerId = 'p1';
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.phase = 'main';
    catan.players[0].addResource('brick', 5);
    catan.players[0].addResource('wool', 5);
    catan.players[0].addResource('grain', 5);
    catan.players[0].addResource('ore', 5);
    catan.players[0].addResource('lumber', 5);
    const hasBuilt = catan.buildSettlement(settlementId);
    const settlement = catan.board.vertices.get(settlementId);

    assert(hasBuilt);
    const hasBuiltCity = catan.buildSettlement(settlementId);
    const game = catan.getGameData(playerId);
    assert(hasBuiltCity);
    assertEquals(game.players.me.resources.brick, 4);
    assertEquals(game.cities.length, 1);
    assertEquals(settlement?.occupiedBy(), playerId);
    assert(settlement?.isOccupied);
  });

  it('should add the city for main mode', () => {
    const playerId = 'p1';
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.phase = 'main';
    catan.players[0].addResource('brick', 5);
    catan.players[0].addResource('wool', 5);
    catan.players[0].addResource('grain', 5);
    catan.players[0].addResource('ore', 5);
    catan.players[0].addResource('lumber', 5);
    const hasBuilt = catan.buildSettlement(settlementId);
    const settlement = catan.board.vertices.get(settlementId);

    assert(hasBuilt);
    const hasBuiltCity = catan.buildSettlement(settlementId);
    catan.players[0].addCity('b1');
    const game = catan.getGameData(playerId);
    assert(hasBuiltCity);
    assertEquals(game.players.me.resources.brick, 4);
    assertEquals(game.cities.length, 1);
    assertEquals(settlement?.occupiedBy(), playerId);
    assert(settlement?.isOccupied);
  });

  it('should get 2 resources for a city', () => {
    const playerId = 'p1';
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.phase = 'main';
    catan.players[0].addResource('brick', 5);
    catan.players[0].addResource('wool', 5);
    catan.players[0].addResource('grain', 5);
    catan.players[0].addResource('ore', 5);
    catan.players[0].addResource('lumber', 5);
    const hasBuilt = catan.buildSettlement(settlementId);
    const settlement = catan.board.vertices.get(settlementId);

    assert(hasBuilt);
    catan.buildSettlement(settlementId);
    assertEquals(settlement?.occupiedBy(), playerId);
    assert(settlement?.isOccupied);
    catan.diceRoll = [2, 3];
    const initialResourceCount = catan.players[0].resources.wool;
    catan.distributeResourcesForDiceRoll();
    const newResourceCount = catan.players[0].resources.wool;
    assert(newResourceCount > initialResourceCount);
  });

  it('should not build if there is already settlement exists for setup mode', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.buildSettlement(settlementId);
    const canBuild = catan.validateBuildSettlement(settlementId, 'p1');
    const settlement = catan.board.vertices.get(settlementId);

    assert(settlement?.isOccupied);
    assertFalse(canBuild);
  });

  it('should be false if the settlement is not valid', () => {
    catan.turns = 0;
    const canBuildSettlement = catan.canBuildInitialSettlement('vertex1');

    assertFalse(canBuildSettlement);
  });

  it('should not build the settlement when adjacent settlements are built', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    const adjSettlementid = 'v0,0|1,-1|1,0';
    catan.buildSettlement(settlementId);
    const canBuild = catan.validateBuildSettlement(adjSettlementid, 'p1');
    catan.board.vertices.get(settlementId);
    const adjacentSettlement = catan.board.vertices.get(adjSettlementid);

    assertFalse(canBuild);
    assertFalse(adjacentSettlement?.occupiedBy());
  });

  it('should build settlement when there is connected road and follows distance rule', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId1 = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';
    const roadId2 = 'e-v0,0|0,1|1,0_v0,0|1,-1|1,0';
    const secondSettlementId = 'v0,0|0,1|1,0';
    const hasBuilt1 = catan.buildSettlement(settlementId);
    catan.buildRoad(roadId1);
    const hasBuilt2 = catan.buildSettlement(secondSettlementId);
    catan.buildRoad(roadId2);

    const settlement2 = catan.board.vertices.get(secondSettlementId);
    const road1 = catan.board.edges.get(roadId1);
    const road2 = catan.board.edges.get(roadId2);
    const settlement1 = catan.board.vertices.get(settlementId);

    assert(hasBuilt1);
    assert(hasBuilt2);
    assertEquals(settlement1?.occupiedBy(), 'p1');
    assertEquals(settlement1?.occupiedBy(), road1?.occupiedBy());
    assertEquals(settlement2?.occupiedBy(), road2?.occupiedBy());
    assert(settlement1?.isOccupied());
    assert(settlement2?.isOccupied());
  });

  it("shouldn't build settlement when there is connected road and follows distance rule but not enough resources", () => {
    const settlementId = 'v0,-2|0,-3|1,-3';
    const roadId1 = 'e-v-1,-2|0,-2|0,-3_v0,-2|0,-3|1,-3';
    const roadId2 = 'e-v-1,-1|-1,-2|0,-2_v-1,-2|0,-2|0,-3';
    const secondSettlementId = 'v-1,-1|-1,-2|0,-2';
    catan.buildSettlement(settlementId);
    catan.buildRoad(roadId1);
    catan.currentPlayerIndex = 0;

    catan.buildRoad(roadId2);
    catan.currentPlayerIndex = 0;
    catan.phase = 'main';
    catan.turn.hasRolled = true;
    const canBuild = catan.validateBuildSettlement(secondSettlementId, 'p1');
    assertFalse(canBuild);
  });

  it("shouldn't build settlement when the vertex doesn't have connected edges", () => {
    const settlementId = 'v0,-2|0,-3|1,-3';
    const roadId1 = 'e-v-1,-2|0,-2|0,-3_v0,-2|0,-3|1,-3';
    const roadId2 = 'e-v-1,-1|-1,-2|0,-2_v-1,-2|0,-2|0,-3';
    const secondSettlementId = 'v-1,-1|-1,-2|0,-2';
    catan.buildSettlement(settlementId);
    catan.buildRoad(roadId1);
    catan.currentPlayerIndex = 0;

    catan.buildRoad(roadId2);
    catan.currentPlayerIndex = 0;
    catan.phase = 'main';
    catan.turn.hasRolled = true;
    const vtx = catan.board.vertices.get(secondSettlementId) || {
      connectedEdges: '',
    };
    vtx.connectedEdges = '';
    const canBuild = catan.validateBuildSettlement(secondSettlementId, 'p1');
    assertFalse(canBuild);
  });

  it('should not build settlement if the phase is invalid', () => {
    catan.phase = 'end';
    const settlementId = 'v0,-1|0,0|1,-1';
    const isBuilt = catan.validateBuildSettlement(settlementId, 'p1');
    const settlement = catan.board.vertices.get(settlementId);

    assertFalse(isBuilt);
    assertFalse(settlement?.isOccupied());
  });

  it('should not build settlement if the vertex is invalid', () => {
    const settlementId = 'v01';
    const isBuilt = catan.validateBuildSettlement(settlementId, 'p2');
    const settlement = catan.board.vertices.get(settlementId);

    assertFalse(isBuilt);
    assertFalse(settlement?.isOccupied());
  });

  it('should be false if the player id is invalid', () => {
    const playerId = '1';
    const settlementId = 'v0,-1|0,0|1,-1';
    const canBuild = catan.validateBuildSettlement(settlementId, playerId);

    assertFalse(canBuild);
  });

  it('should build the initial settlement if the phase is setup', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.phase = 'setup';
    const canBuild = catan.validateBuildSettlement(settlementId, 'p1');

    assert(canBuild);
  });

  it("shouldn't build the settlement if doesn't have enough resources", () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    catan.phase = 'main';
    const canBuild = catan.validateBuildSettlement(settlementId, 'p1');

    assertFalse(canBuild);
  });

  it('should be false if the there are no connected edges', () => {
    catan.turns = 0;
    const settlementId = 'v0,-1|0,0|1,-1';
    const vertex = catan.board.vertices.get(settlementId) || {
      connectedVertices: '',
    };
    catan.phase = 'main';
    vertex.connectedVertices = '';

    const canBuild = catan.canBuildInitialSettlement(settlementId);

    const vertex2 = catan.board.vertices.get(settlementId) || {
      connectedEdges: '',
    };
    vertex2.connectedEdges = '';

    const canBuild2 = catan.validateBuildSettlement(settlementId, 'p1');

    assert(canBuild);
    assertFalse(canBuild2);
  });
});

describe('buildRoad', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should not be able to build road near other than the latest settlement', () => {
    const edgeId = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';
    catan.turns = 1;
    const isBuilt = catan.canBuildInitialRoad(edgeId);

    assertFalse(isBuilt);
  });

  it('should build Road when there is a settlement near it', () => {
    const playerId = 'p1';
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';

    catan.buildSettlement(settlementId);

    const settlement = catan.board.vertices.get(settlementId);
    const isBuilt = catan.buildRoad(roadId);
    const road = catan.board.edges.get(roadId);

    assert(isBuilt);
    assertEquals(road?.occupiedBy(), playerId);
    assertEquals(settlement?.occupiedBy(), road?.occupiedBy());
  });

  it('should build Road when there is a connecting road of the current player', () => {
    const playerId = 'p1';
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId1 = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';
    const roadId2 = 'e-v0,0|0,1|1,0_v0,0|1,-1|1,0';
    const gameState = catan.getGameState('p1');
    gameState.players.me.resources.brick = 5;
    gameState.players.me.resources.lumber = 5;
    gameState.players.me.resources.wool = 5;
    gameState.players.me.resources.grain = 5;

    catan.phase = 'main';
    catan.buildSettlement(settlementId);
    catan.board.vertices.get(settlementId);
    catan.buildRoad(roadId1);

    catan.currentPlayerIndex = 0;
    catan.turn.hasRolled = true;
    catan.validateBuildRoad('r1', 'p1');
    const vertex = new Vertex('s1', null);
    catan.board.vertices.set('s1', vertex);
    catan.validateBuildSettlement('s1', 'p1');
    catan.validateBuildSettlement('v0,-2|0,-3|1,-3', 'p1');
    const canBuild = catan.validateBuildRoad(roadId2, playerId);
    const road1 = catan.board.edges.get(roadId1);

    assert(canBuild);
    assertEquals(road1?.occupiedBy(), playerId);
  });

  it('should not build road if the edge is invalid', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId1 = 'e1';

    catan.buildSettlement(settlementId);
    catan.board.vertices.get(settlementId);
    catan.buildRoad(roadId1);

    const canBuild = catan.validateBuildRoad(roadId1, 'p1');
    const road1 = catan.board.edges.get(roadId1);

    assertFalse(canBuild);
    assertFalse(road1?.occupiedBy());
  });

  it('should not build road if the connectedEdges is invalid', () => {
    const roadId = 'e-v0,-1|0,0|1,-1_v0,0|1,-1';
    catan.phase = 'main';

    const built = catan.validateBuildRoad(roadId, 'p1');

    assertFalse(built);
  });

  it('should build the initial road if the phase is setup', () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId1 = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';

    catan.phase = 'setup';
    catan.buildSettlement(settlementId);

    const canBuild = catan.validateBuildRoad(roadId1, 'p1');

    assert(canBuild);
  });

  it("shouldn't build road in main phase if player has enough resources", () => {
    const settlementId = 'v0,-1|0,0|1,-1';
    const roadId1 = 'e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0';

    catan.buildSettlement(settlementId);
    catan.phase = 'main';

    const canBuild = catan.validateBuildRoad(roadId1, 'p1');
    assertFalse(canBuild);
  });
});

describe('distribute Resources', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should distribute resources for player1', () => {
    catan.diceFn = () => 5;
    catan.players[0].settlements.push('v-1,1|-1,2|0,1');
    const diceRoll = catan.rollDice();

    assertEquals(diceRoll, { isRobber: false, rolled: [5, 5] });
    assertEquals(catan.players[0].resources.lumber, 1);
  });

  it('should distribute resources for city for player1', () => {
    catan.updateResource({
      playerId: 'p1',
      resource: 'lumber',
      buildingType: 'city',
    });

    assertEquals(catan.players[0].resources.lumber, 2);
  });
});

describe('longest army', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should get the largest army card if three knights are played', () => {
    const player = catan.players[0];
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    assert(player.hasLargestArmy);
  });

  it('should get the largest army card if beaten the player with 3 knight cards', () => {
    const player = catan.players[0];
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    assertEquals(player.victoryPoints, 2);

    const player2 = catan.players[1];
    catan.currentPlayerIndex = 1;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 1;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 1;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 1;
    catan.playDevCard('knight');
    assert(player2.hasLargestArmy);
    assertEquals(player.victoryPoints, 0);
    assertEquals(player2.victoryPoints, 2);
  });
});

describe('buyDevCard', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const resources = {
      ore: 25,
      brick: 25,
      lumber: 25,
      wool: 25,
      grain: 25,
    };
    const devCards: DevelopmentCards[] = [
      'knight',
      'knight',
      'monopoly',
      'knight',
    ];
    const supply = { resources, devCards };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should buy dev cards when its my turn and I have enough resources', () => {
    catan.phase = 'main';
    const player = catan.players[catan.currentPlayerIndex];
    player.resources = { brick: 0, lumber: 0, grain: 1, wool: 1, ore: 1 };
    catan.turn.hasRolled = true;
    catan.supply.devCards = ['monopoly'];
    catan.currentPlayerIndex = 0;
    catan.turn.hasRolled = true;
    const outcome = catan.buyDevCard('p1');

    assert(outcome.isSucceed);
    assertEquals(outcome.result, 'monopoly');
    assertEquals(outcome.message, '');
  });

  it('should update the dev cards supply when the player buys the dev Card', () => {
    catan.phase = 'main';
    const player = catan.players[catan.currentPlayerIndex];
    player.resources = { brick: 0, lumber: 0, grain: 1, wool: 1, ore: 1 };
    catan.turn.hasRolled = true;
    catan.supply.devCards = ['monopoly', 'knight'];
    catan.currentPlayerIndex = 0;
    catan.turn.hasRolled = true;
    const outcome = catan.buyDevCard('p1');

    assert(outcome.isSucceed);
    assertEquals(outcome.result, 'monopoly');
    assertEquals(catan.supply.devCards, ['knight']);
    assertEquals(outcome.message, '');
  });

  it("shouldn't buy dev cards when its not my turn", () => {
    catan.phase = 'main';
    const player = catan.players[catan.currentPlayerIndex];
    player.resources = { brick: 0, lumber: 0, grain: 1, wool: 1, ore: 1 };
    const outcome = catan.buyDevCard('p2');

    assertFalse(outcome.isSucceed);
    assertEquals(outcome.message, 'You are not the current player');
  });

  it("shouldn't buy dev cards when its my turn and I don't have enough resources", () => {
    catan.phase = 'main';
    const player = catan.players[catan.currentPlayerIndex];
    catan.supply.devCards = ['knight'];

    player.resources = { brick: 0, lumber: 0, grain: 0, wool: 1, ore: 1 };
    catan.turn.hasRolled = true;
    const result = catan.buyDevCard('p1');
    assertFalse(result.isSucceed);
    assertEquals(result.message, "You don't have enough resources");
  });

  it("shouldn't buy dev cards when its my turn and I haven't rolled the dice", () => {
    catan.phase = 'main';
    const player = catan.players[catan.currentPlayerIndex];
    player.resources = { brick: 0, lumber: 0, grain: 0, wool: 1, ore: 1 };
    const result = catan.buyDevCard('p1');

    assertFalse(result.isSucceed);
    assertEquals(result.message, "You haven't rolled the dice");
  });

  it("shouldn't buy dev cards when supply of dev cards is empty", () => {
    catan.phase = 'main';
    const player = catan.players[catan.currentPlayerIndex];
    player.resources = { brick: 0, lumber: 0, grain: 1, wool: 1, ore: 1 };
    catan.turn.hasRolled = true;
    catan.currentPlayerIndex = 0;
    catan.supply.devCards = [];
    const result = catan.buyDevCard('p1');

    assertFalse(result.isSucceed);
    assertEquals(result.message, 'The development card Deck is empty');
  });
});

describe('possible build locations', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const resources = {
      ore: 25,
      brick: 25,
      lumber: 25,
      wool: 25,
      grain: 25,
    };
    const devCards: DevelopmentCards[] = [
      'knight',
      'knight',
      'monopoly',
      'knight',
    ];
    const supply = { resources, devCards };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should get all the valid settlements', () => {
    const validSettlements = catan.getAvailableBuilds('p1');

    assertEquals(validSettlements.get('settlements')?.size, 54);
  });

  it('should get rest of the valid settlements', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.turns = 2;
    const validSettlements = catan.getAvailableBuilds('p1');

    assertEquals(validSettlements.get('settlements')?.size, 50);
  });

  it('should get all the valid positions for placing settlements in main phase', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.phase = 'main';
    catan.turn.hasRolled = true;
    catan.players[0].resources.lumber = 5;
    catan.players[0].resources.brick = 5;

    const validSettlements = catan.getAvailableBuilds('p1');

    assertEquals(validSettlements.get('settlements')?.size, 0);
    assertEquals(validSettlements.get('roads')?.size, 3);
  });

  it('should get all the valid positions for placing settlements in main phase', () => {
    catan.buildSettlement('v-1,0|0,-1|0,0');
    catan.phase = 'main';
    catan.players[0].resources.lumber = 5;
    catan.players[0].resources.brick = 5;
    catan.players[0].resources.wool = 2;
    catan.players[0].resources.grain = 2;

    catan.buildRoad('e-v-1,0|0,-1|0,0_v0,-1|0,0|1,-1');
    catan.buildRoad('e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0');
    catan.turn.hasRolled = true;
    const validSettlements = catan.getAvailableBuilds('p1');

    assertEquals(validSettlements.get('settlements')?.size, 1);
    assertEquals(validSettlements.get('roads')?.size, 5);
  });

  it('should get all the valid positions for placing roads in initial setup', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.turns = 1;

    const validRoads = catan.getAvailableBuilds('p1');

    assertEquals(validRoads.get('roads')?.size, 3);
  });

  it('should get all the valid positions for placing roads in main phase', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.phase = 'main';
    catan.players[0].resources.lumber = 5;
    catan.players[0].resources.brick = 5;
    catan.turn.hasRolled = true;

    const validRoads = catan.getAvailableBuilds('p1');

    assertEquals(validRoads.get('roads')?.size, 3);
  });

  it('should get all the valid positions for placing roads in roadBuilding phase', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.phase = 'main';
    catan.turn.hasRolled = true;
    catan.roadBuilding.shouldBuild = true;
    const validRoads = catan.getAvailableBuilds('p1');

    assertEquals(validRoads.get('roads')?.size, 3);
  });

  it('should be able to place roads in roadBuilding phase', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.phase = 'main';
    catan.turn.hasRolled = true;

    catan.roadBuilding.shouldBuild = true;
    catan.currentPlayerIndex = 0;
    const canBuild = catan.validateBuildRoad(
      'e-v0,1|0,2|1,1_v0,1|1,0|1,1',
      'p1',
    );

    assert(canBuild);
  });

  it('should not get anything if it is not current player', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.phase = 'main';

    const validRoads = catan.getAvailableBuilds('p2');

    assertEquals(validRoads.get('roads')?.size, 0);
  });
});

describe('longest road', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades,notifications);
  });

  it('should calculate the longest road of 3', () => {
    const player = catan.players[0];
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,-1|-1,0|-2,0_v-1,0|-2,0|-2,1');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,0|-1,1|-2,1_v-1,0|-2,0|-2,1');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,0|-1,1|-2,1_v-1,1|-2,1|-2,2');

    const longestRoad = catan.longestRoadOf(player.id);
    assertEquals(longestRoad, 3, 'Longest road should be 3');
  });

  it('should calculate the longest road of 4', () => {
    const player = catan.players[0];
    catan.currentPlayerIndex = 0;

    catan.buildRoad('e-v-1,0|-1,1|0,0_v-1,1|0,0|0,1');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,1|0,0|0,1_v0,0|0,1|1,0');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,1|-1,2|0,1_v-1,1|0,0|0,1');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,1|-1,2|-2,2_v-1,1|-1,2|0,1');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,1|-1,2|-2,2_v-1,2|-2,2|-2,3');

    const longestRoad = catan.longestRoadOf(player.id);
    assertEquals(longestRoad, 4, 'Longest road should be 4');
    assertEquals(player.longestRoadCount, 4, 'Longest road should be 4');
  });

  it('should calculate the longest road with a loop', () => {
    const player = catan.players[0];

    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,-2|0,-2|0,-3_v0,-2|0,-3|1,-3');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,-1|-1,-2|0,-2_v-1,-2|0,-2|0,-3');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,-1|-1,-2|0,-2_v-1,-1|0,-1|0,-2');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v-1,-1|0,-1|0,-2_v0,-1|0,-2|1,-2');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v0,-1|0,-2|1,-2_v0,-2|1,-2|1,-3');
    catan.currentPlayerIndex = 0;
    catan.buildRoad('e-v0,-2|0,-3|1,-3_v0,-2|1,-2|1,-3');

    const longestRoad = catan.longestRoadOf(player.id);
    assertEquals(longestRoad, 6, 'Longest road should be 6');
    assertEquals(player.longestRoadCount, 6);
    assertEquals(player.victoryPoints, 2);
  });

  it('should give 1 for invalid roads', () => {
    const player = catan.players[0];

    catan.currentPlayerIndex = 0;
    catan.buildRoad('notARoad');

    const longestRoad = catan.longestRoadOf(player.id);
    assertEquals(longestRoad, 1, 'Longest road should be 1 by default');
  });

  it('should give 1 for invalid edges', () => {
    const player = catan.players[0];
    const edge = new Edge('invalid-edge', ['v1', 'v2']);
    catan.board.edges.set('invalid-edge', edge);
    const vertex = {
      id: 'v1',
      connectedEdges: null,
    } as unknown as Vertex;
    catan.board.vertices.set('v1', vertex);
    catan.currentPlayerIndex = 0;
    catan.buildRoad('invalid-edge');

    const longestRoad = catan.longestRoadOf(player.id);
    assertEquals(longestRoad, 1, 'Longest road should be 1 by default');
  });
});

describe('play monopoly', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry)
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should get the ore from all players', () => {
    const player = catan.players[0];
    player.addResource('ore', 3);
    const player2 = catan.players[1];
    player2.addResource('ore', 0);
    const player3 = catan.players[2];
    player3.addResource('ore', 1);
    const player4 = catan.players[3];
    player4.addResource('ore', 2);

    catan.playMonopoly('ore');
    assertEquals(player.resources.ore, 6);
  });
});

describe('play road building', () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    const trades = new TradeManager();
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    const notifications = new Notification(setExpiry);
    catan = new Catan('game123', players, board, _.random, supply, trades, notifications);
  });

  it('should not be able to any action until 2 roads are placed', () => {
    catan.playRoadBuilding();
    const player = catan.players[0];
    catan.turn.hasRolled = true;
    catan.phase = 'main';
    const gameData = catan.getGameData(player.id);
    assertFalse(gameData.availableActions.canTrade);
    assert(catan.roadBuilding.shouldBuild);
    assertEquals(catan.roadBuilding.count, 2);
    catan.buildRoad('e1');
    assertEquals(catan.roadBuilding.count, 1);
    assert(catan.roadBuilding.shouldBuild);
    catan.buildRoad('e2');
    assertEquals(catan.roadBuilding.count, 2);
    assertFalse(catan.roadBuilding.shouldBuild);
    const gameData2 = catan.getGameData(player.id);
    assert(gameData2.availableActions.canTrade);
  });

  it('should not be able to any action until 2 roads are placed', () => {
    catan.playRoadBuilding();
    const player = catan.players[0];
    catan.turn.hasRolled = true;
    catan.phase = 'main';
    const gameData = catan.getGameData(player.id);
    assertFalse(gameData.availableActions.canTrade);
    assert(catan.roadBuilding.shouldBuild);
    assertEquals(catan.roadBuilding.count, 2);
    catan.buildRoad('e1');
    assertEquals(catan.roadBuilding.count, 1);
    assert(catan.roadBuilding.shouldBuild);
    catan.buildRoad('e2');
    assertEquals(catan.roadBuilding.count, 2);
    assertFalse(catan.roadBuilding.shouldBuild);
    const gameData2 = catan.getGameData(player.id);
    assert(gameData2.availableActions.canTrade);
  });

  it('should return empty possible settlements when the phase is road building', () => {
    catan.playRoadBuilding();

    const settlements = catan.getAvailableLocations(
      'settlement',
      'roadBuilding',
      'p1',
    );

    assertEquals(settlements.size, 0);
  });

  it('should return empty possible settlements when the phase is road building', () => {
    catan.playRoadBuilding();

    const road = catan.getAvailableLocations('road', 'roadBuilding', 'p1');
    assertEquals(road.size, 0);
  });

  it('should return empty cities when the phase is main', () => {
    const cities = catan.getAvailableLocations('city', 'main', 'p1');

    assertEquals(cities.size, 0);
  });

  it('should return cities when the phase is main with no resources', () => {
    catan.rollDice();
    const cities = catan.getAvailableLocations('city', 'main', 'p1');

    assertEquals(cities.size, 0);
  });

  it('should return settlements when the phase is main', () => {
    catan.rollDice();
    catan.players[0].addResource('brick', 5);
    catan.players[0].addResource('wool', 5);
    catan.players[0].addResource('grain', 5);
    catan.players[0].addResource('ore', 5);
    catan.players[0].addResource('lumber', 5);
    catan.buildSettlement('v0,1|0,2|1,1');
    const cities = catan.getAvailableLocations('city', 'main', 'p1');

    assertEquals(cities.size, 1);
  });

  it('should be true if player can actually build city', () => {
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.players[0].addResource('brick', 5);
    catan.players[0].addResource('wool', 5);
    catan.players[0].addResource('grain', 5);
    catan.players[0].addResource('ore', 5);
    catan.players[0].addResource('lumber', 5);

    const canBuild = catan.canBuildCity('v0,1|0,2|1,1');

    assert(canBuild);
  });

  it('should be true if player  cannot actually build city', () => {
    catan.buildSettlement('v0,1|0,2|1,1');

    const canBuild = catan.canBuildCity('v0,1|0,2|1,1');

    assertFalse(canBuild);
  });
});
