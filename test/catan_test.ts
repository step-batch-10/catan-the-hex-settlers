import _ from "lodash";
import { Vertex } from "../src/models/vertex.ts";
import { assertEquals, assert, assertFalse } from 'assert';
import { describe, it, beforeEach } from 'testing/bdd';
import type { VertexData, EdgeData, Resources } from '../src/types.ts';
import { Catan } from '../src/models/catan.ts';
import { Player } from '../src/models/player.ts';
import { Board } from '../src/models/board.ts';
import { defaultResources } from "../src/types.ts";


describe("Catan", () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player("p1", "Adil", "red"));
    players.push(new Player("p2", "Aman", "blue"));
    players.push(new Player("p3", "Vineet", "orange"));
    players.push(new Player("p4", "Shalu", "white"));
    const board = new Board();
    board.createBoard();

    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    catan = new Catan('game123', players, board, _.random, supply);
  });

  it("should initialize the game correctly", () => {
    assertEquals(catan.gameId, "game123");
    assertEquals(catan.players.length, 4);
    assertEquals(catan.phase, "setup");
    assertEquals(catan.currentPlayerIndex, 0);
    assertEquals(catan.turns, 0);
    assertEquals(catan.diceRoll.length, 2);
  });

  it("should roll the dice correctly", () => {
    catan.diceFn = () => 5;
    const diceRoll = catan.rollDice();

    assertEquals(diceRoll, [5, 5]);
    assertEquals(catan.turns, 1);
  });

  it("should change the turn correctly", () => {
    catan.turns = 17;
    catan.turn.hasRolled = true;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 1);

    catan.turn.hasRolled = true;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 2);
  });

  it("should check if player can roll", () => {
    const player1 = catan.players[0];
    const canRoll = catan.canRoll(player1.id);

    catan.phase = "setup";
    const cannotRoll = catan.canRoll(player1.id);

    assertFalse(canRoll);
    assertFalse(cannotRoll);
  });

  it("should allow players to build settlements on the correct turns", () => {
    const canBuildSettlement =
      catan.canBuildInitialSettlement("v0,-1|0,0|1,-1");

    catan.turns = 1;
    const cannotBuildSettlement = catan.canBuildInitialSettlement("v1");

    assert(canBuildSettlement);
    assertFalse(cannotBuildSettlement);
  });

  it("should allow players to build roads on the correct turns", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";
    catan.buildSettlement(settlementId);
    catan.turns = 0;
    const canBuildRoad = catan.canBuildInitialRoad(roadId1);

    catan.turns = 1;
    const canBuildRoadNow = catan.canBuildInitialRoad(roadId1);

    assertFalse(canBuildRoad);
    assertEquals(canBuildRoadNow, true);
  });

  it("should build a road correctly", () => {
    const edgeId = "e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2";
    const gameState = catan.getGameState("p1");
    gameState.players.me.resources.brick = 1;
    gameState.players.me.resources.lumber = 1;
    const result = catan.buildRoad(edgeId);
    const edges = catan.getOccupiedEdges();

    assert(result);
    assertEquals(edges, [
      { id: "e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2", color: "red" },
    ]);
  });

  it("should build a settlement correctly", () => {
    const vertexId = "v1_1";
    const result = catan.buildSettlement(vertexId);

    assert(result);
  });

  it("should provide game state correctly", () => {
    const player1 = catan.players[0];
    catan.turn.hasRolled = true;
    const gameState: {
      gameId: string;
      diceRoll: number[];
      board: { hexes: object[]; vertices: VertexData[]; edges: EdgeData[] };
    } = catan.getGameState(player1.id);

    assertEquals(gameState.gameId, "game123");
    assert(gameState.diceRoll.length === 2, "Dice roll should be present.");
    assert(gameState.board.hexes.length > 0, "Board hexes should be present.");
    assert(
      gameState.board.vertices.length > 0,
      "Board vertices should be present."
    );
    assert(gameState.board.edges.length > 0, "Board edges should be present.");
  });

  it("should correctly change the game phase from setup to main", () => {
    catan.changePhaseToMain();

    assertEquals(catan.phase, "main");
  });

  it("should reverse turn order correctly after turn 8", () => {
    catan.turns = 8;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);

    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);

    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);
  });

  it("should distribute resources when a settlement is built", () => {
    const vertexId = "v0,0|1,-1|1,0";
    const player = catan.players[catan.currentPlayerIndex];
    player.settlements.push("");

    const initialResourceCount = player.resources.brick;
    catan.buildSettlement(vertexId);

    const newResourceCount = player.resources.brick;
    const vertices = catan.getOccupiedVertices();

    assert(
      newResourceCount > initialResourceCount,
      "Player should receive resources after building a settlement."
    );
    assertEquals(vertices, [{ id: "v0,0|1,-1|1,0", color: "red" }]);
  });

  it("should change the phase to main", () => {
    catan.turns = 16;
    catan.changePhaseToMain();

    assertEquals(catan.phase, "main");
  });

  it("should be able to roll", () => {
    catan.turns = 16;
    catan.changePhaseToMain();

    assertEquals(catan.phase, "main");
    catan.changeTurn();
    catan.players[0] = new Player("p1", "Adil", "red");
    catan.currentPlayerIndex = 0;
    const canRoll = catan.canRoll("p1");
    assert(canRoll);
  });

  it("should not trade in setup phase", () => {
    const availableActions = catan.getAvailableActions("p1");

    assertFalse(availableActions.canTrade);
  });

  it("should not trade in main phase", () => {
    catan.phase = "main";
    const availableActions = catan.getAvailableActions("p1");

    assertFalse(availableActions.canTrade);
  });

  it("should not trade if not current player in main phase", () => {
    catan.phase = "main";
    const availableActions = catan.getAvailableActions("p2");

    assertFalse(availableActions.canTrade);
  });

  it("should not trade if current player in main phase and hasn't rolled the dice", () => {
    catan.phase = "main";
    catan.turn.hasRolled = false;
    const availableActions = catan.getAvailableActions("p2");

    assertFalse(availableActions.canTrade);
  });

  it("should  trade if current player in main phase and has rolled the dice", () => {
    catan.phase = "main";
    catan.turn.hasRolled = true;
    const availableActions = catan.getAvailableActions("p1");

    assert(availableActions.canTrade);
  });
});

describe("buildSettlement ", () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player("p1", "Adil", "red"));
    players.push(new Player("p2", "Aman", "blue"));
    players.push(new Player("p3", "Vineet", "orange"));
    players.push(new Player("p4", "Shalu", "white"));
    const board = new Board();
    board.createBoard();

    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    catan = new Catan('game123', players, board, _.random, supply);
  });

  it("should build the settlement for setup mode", () => {
    const playerId = "p1";
    const settlementId = "v0,-1|0,0|1,-1";
    const hasBuilt = catan.buildSettlement(settlementId);
    const settlement = catan.board.vertices.get(settlementId);

    assert(hasBuilt);
    assertEquals(settlement?.occupiedBy(), playerId);
    assert(settlement?.isOccupied);
  });

  it("should not build if there is already settlement exists for setup mode", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    catan.buildSettlement(settlementId);
    const canBuild = catan.validateBuildSettlement(settlementId, "p1");
    const settlement = catan.board.vertices.get(settlementId);

    assert(settlement?.isOccupied);
    assertFalse(canBuild);
  });

  it("should be false if the settlement is not valid", () => {
    catan.turns = 0;
    const canBuildSettlement = catan.canBuildInitialSettlement("vertex1");

    assertFalse(canBuildSettlement);
  });

  it("should not build the settlement when adjacent settlements are built", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const adjSettlementid = "v0,0|1,-1|1,0";
    catan.buildSettlement(settlementId);
    const canBuild = catan.validateBuildSettlement(adjSettlementid, "p1");
    catan.board.vertices.get(settlementId);
    const adjacentSettlement = catan.board.vertices.get(adjSettlementid);

    assertFalse(canBuild);
    assertFalse(adjacentSettlement?.occupiedBy());
  });

  it("should build settlement when there is connected road and follows distance rule", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";
    const roadId2 = "e-v0,0|0,1|1,0_v0,0|1,-1|1,0";
    const secondSettlementId = "v0,0|0,1|1,0";
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
    assertEquals(settlement1?.occupiedBy(), "p1");
    assertEquals(settlement1?.occupiedBy(), road1?.occupiedBy());
    assertEquals(settlement2?.occupiedBy(), road2?.occupiedBy());
    assert(settlement1?.isOccupied());
    assert(settlement2?.isOccupied());
  });

  it("shouldn't build settlement when there is connected road and follows distance rule but not enough resources", () => {
    const settlementId = "v0,-2|0,-3|1,-3";
    const roadId1 = "e-v-1,-2|0,-2|0,-3_v0,-2|0,-3|1,-3";
    const roadId2 = "e-v-1,-1|-1,-2|0,-2_v-1,-2|0,-2|0,-3";
    const secondSettlementId = "v-1,-1|-1,-2|0,-2";
    catan.buildSettlement(settlementId);
    catan.buildRoad(roadId1);
    catan.currentPlayerIndex = 0;

    catan.buildRoad(roadId2);
    catan.currentPlayerIndex = 0;
    catan.phase = "main";
    catan.turn.hasRolled = true;
    const canBuild = catan.validateBuildSettlement(secondSettlementId, "p1");
    assertFalse(canBuild);
  });

  it("shouldn't build settlement when the vertex doesn't have connected edges", () => {
    const settlementId = "v0,-2|0,-3|1,-3";
    const roadId1 = "e-v-1,-2|0,-2|0,-3_v0,-2|0,-3|1,-3";
    const roadId2 = "e-v-1,-1|-1,-2|0,-2_v-1,-2|0,-2|0,-3";
    const secondSettlementId = "v-1,-1|-1,-2|0,-2";
    catan.buildSettlement(settlementId);
    catan.buildRoad(roadId1);
    catan.currentPlayerIndex = 0;

    catan.buildRoad(roadId2);
    catan.currentPlayerIndex = 0;
    catan.phase = "main";
    catan.turn.hasRolled = true;
    const vtx = catan.board.vertices.get(secondSettlementId) || {
      connectedEdges: "",
    };
    vtx.connectedEdges = "";
    const canBuild = catan.validateBuildSettlement(secondSettlementId, "p1");
    assertFalse(canBuild);
  });

  it("should not build settlement if the phase is invalid", () => {
    catan.phase = "end";
    const settlementId = "v0,-1|0,0|1,-1";
    const isBuilt = catan.validateBuildSettlement(settlementId, "p1");
    const settlement = catan.board.vertices.get(settlementId);

    assertFalse(isBuilt);
    assertFalse(settlement?.isOccupied());
  });

  it("should not build settlement if the vertex is invalid", () => {
    const settlementId = "v01";
    const isBuilt = catan.validateBuildSettlement(settlementId, "p2");
    const settlement = catan.board.vertices.get(settlementId);

    assertFalse(isBuilt);
    assertFalse(settlement?.isOccupied());
  });

  it("should be false if the player id is invalid", () => {
    const playerId = "1";
    const settlementId = "v0,-1|0,0|1,-1";
    const canBuild = catan.validateBuildSettlement(settlementId, playerId);

    assertFalse(canBuild);
  });

  it("should build the initial settlement if the phase is setup", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    catan.phase = "setup";
    const canBuild = catan.validateBuildSettlement(settlementId, "p1");

    assert(canBuild);
  });

  it("shouldn't build the settlement if doesn't have enough resources", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    catan.phase = "main";
    const canBuild = catan.validateBuildSettlement(settlementId, "p1");

    assertFalse(canBuild);
  });

  it("should be false if the there are no connected edges", () => {
    catan.turns = 0;
    const settlementId = "v0,-1|0,0|1,-1";
    const vertex = catan.board.vertices.get(settlementId) || {
      connectedVertices: "",
    };
    catan.phase = "main";
    vertex.connectedVertices = "";

    const canBuild = catan.canBuildInitialSettlement(settlementId);

    const vertex2 = catan.board.vertices.get(settlementId) || {
      connectedEdges: "",
    };
    vertex2.connectedEdges = "";

    const canBuild2 = catan.validateBuildSettlement(settlementId, "p1");

    assert(canBuild);
    assertFalse(canBuild2);
  });
});

describe("buildRoad", () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player("p1", "Adil", "red"));
    players.push(new Player("p2", "Aman", "blue"));
    players.push(new Player("p3", "Vineet", "orange"));
    players.push(new Player("p4", "Shalu", "white"));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    catan = new Catan('game123', players, board, _.random, supply);
  });

  it("should not be able to build road near other than the latest settlement", () => {
    const edgeId = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";
    catan.turns = 1;
    const isBuilt = catan.canBuildInitialRoad(edgeId);

    assertFalse(isBuilt);
  });

  it("should build Road when there is a settlement near it", () => {
    const playerId = "p1";
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";

    catan.buildSettlement(settlementId);

    const settlement = catan.board.vertices.get(settlementId);
    const isBuilt = catan.buildRoad(roadId);
    const road = catan.board.edges.get(roadId);

    assert(isBuilt);
    assertEquals(road?.occupiedBy(), playerId);
    assertEquals(settlement?.occupiedBy(), road?.occupiedBy());
  });

  it("should build Road when there is a connecting road of the current player", () => {
    const playerId = "p1";
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";
    const roadId2 = "e-v0,0|0,1|1,0_v0,0|1,-1|1,0";
    const gameState = catan.getGameState("p1");
    gameState.players.me.resources.brick = 5;
    gameState.players.me.resources.lumber = 5;
    gameState.players.me.resources.wool = 5;
    gameState.players.me.resources.grain = 5;

    catan.phase = "main";
    catan.buildSettlement(settlementId);
    catan.board.vertices.get(settlementId);
    catan.buildRoad(roadId1);

    catan.currentPlayerIndex = 0;
    catan.turn.hasRolled = true;
    catan.validateBuildRoad("r1", "p1");
    const vertex = new Vertex("s1", null);
    catan.board.vertices.set("s1", vertex);
    catan.validateBuildSettlement("s1", "p1");
    catan.validateBuildSettlement("v0,-2|0,-3|1,-3", "p1");
    const canBuild = catan.validateBuildRoad(roadId2, playerId);
    const road1 = catan.board.edges.get(roadId1);

    assert(canBuild);
    assertEquals(road1?.occupiedBy(), playerId);
  });

  it("should not build road if the edge is invalid", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e1";

    catan.buildSettlement(settlementId);
    catan.board.vertices.get(settlementId);
    catan.buildRoad(roadId1);

    const canBuild = catan.validateBuildRoad(roadId1, "p1");
    const road1 = catan.board.edges.get(roadId1);

    assertFalse(canBuild);
    assertFalse(road1?.occupiedBy());
  });

  it("should not build road if the connectedEdges is invalid", () => {
    const roadId = "e-v0,-1|0,0|1,-1_v0,0|1,-1";
    catan.phase = "main";

    const built = catan.validateBuildRoad(roadId, "p1");

    assertFalse(built);
  });

  it("should build the initial road if the phase is setup", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";

    catan.phase = "setup";
    catan.buildSettlement(settlementId);

    const canBuild = catan.validateBuildRoad(roadId1, "p1");

    assert(canBuild);
  });

  it("shouldn't build road in main phase if player has enough resources", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";

    catan.phase = "main";
    catan.buildSettlement(settlementId);

    const canBuild = catan.validateBuildRoad(roadId1, "p1");

    assertFalse(canBuild);
  });
});

describe("distribute Resources", () => {
  let catan: Catan;

  beforeEach(() => {
    const players = [];
    players.push(new Player("p1", "Adil", "red"));
    players.push(new Player("p2", "Aman", "blue"));
    players.push(new Player("p3", "Vineet", "orange"));
    players.push(new Player("p4", "Shalu", "white"));
    const board = new Board();
    board.createBoard();
    const supply: { resources: Resources; devCards: [] } = {
      resources: defaultResources,
      devCards: [],
    };
    catan = new Catan('game123', players, board, _.random, supply);
  });

  it("should distribute resources for player1", () => {
    catan.diceFn = () => 5;
    catan.players[0].settlements.push("v-1,1|-1,2|0,1");
    const diceRoll = catan.rollDice();

    assertEquals(diceRoll, [5, 5]);
    console.log('added the resource');
    assertEquals(catan.players[0].resources.lumber, 1);
  });

  it("should distribute resources for city for player1", () => {
    catan.updateResource({
      playerId: "p1",
      resource: "lumber",
      buildingType: "city",
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
    catan = new Catan('game123', players, board, _.random, supply);
  });

  it('should get the largest army card', () => {
    const player = catan.players[0];
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    catan.currentPlayerIndex = 0;
    catan.playDevCard('knight');
    console.log(player.id);
  });
});
