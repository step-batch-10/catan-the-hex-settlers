import { assertEquals, assert, assertFalse } from "assert";
import { describe, it, beforeEach } from "testing/bdd";
import { Catan } from "../src/models/catan.ts";
import { Player } from "../src/models/player.ts";

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

describe("Catan", () => {
  let catan: Catan;

  beforeEach(() => {
    catan = new Catan();
    catan.mockGame();
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
    const diceRoll = catan.rollDice();
    assert(
      diceRoll[0] >= 1 && diceRoll[0] <= 6,
      "First dice should be between 1 and 6."
    );
    assert(
      diceRoll[1] >= 1 && diceRoll[1] <= 6,
      "Second dice should be between 1 and 6."
    );
    assertEquals(catan.turns, 1);
  });

  it("should change the turn correctly", () => {
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 1);

    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 2);

    catan.turns = 12;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 1);
  });

  it("should correctly handle setup phase", () => {
    assertEquals(catan.phase, "setup");
    catan.turns = 4;
    catan.changePhase();
    assertEquals(catan.phase, "setup");
  });

  it("should check if player can roll", () => {
    const player1 = catan.players[0];
    const canRoll = catan.canRoll(player1.id);
    assertFalse(canRoll);

    catan.phase = "setup";
    const cannotRoll = catan.canRoll(player1.id);
    assertFalse(cannotRoll);
  });

  it("should allow players to build settlements on the correct turns", () => {
    const canBuildSettlement =
      catan.canBuildInitialSettlement("v0,-1|0,0|1,-1");
    assert(canBuildSettlement);

    catan.turns = 1;
    const cannotBuildSettlement = catan.canBuildInitialSettlement("v1");
    assertFalse(cannotBuildSettlement);
  });

  it("should allow players to build roads on the correct turns", () => {
    const settlementId = "v0,-1|0,0|1,-1";
    const roadId1 = "e-v0,-1|0,0|1,-1_v0,0|1,-1|1,0";
    catan.buildSettlement(settlementId);
    catan.turns = 0;
    const canBuildRoad = catan.canBuildInitialRoad(roadId1);
    assertFalse(canBuildRoad);

    catan.turns = 1;
    const canBuildRoadNow = catan.canBuildInitialRoad(roadId1);
    assertEquals(canBuildRoadNow, true);
  });

  it("should build a road correctly", () => {
    const edgeId = "e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2";
    const result = catan.buildRoad(edgeId);
    assert(result);

    const edges = catan.getOccupiedEdges();
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
    const gameState: {
      gameId: string;
      diceRoll: number[];
      board: { hexes: object[]; vertices: VertexData[]; edges: EdgeData[] };
      availableActions: { canRoll: boolean };
    } = catan.getGameState(player1.id);

    assertEquals(gameState.gameId, "game123");
    assert(gameState.diceRoll.length === 2, "Dice roll should be present.");
    assert(gameState.board.hexes.length > 0, "Board hexes should be present.");
    assert(
      gameState.board.vertices.length > 0,
      "Board vertices should be present."
    );
    assert(gameState.board.edges.length > 0, "Board edges should be present.");
    assert(
      gameState.availableActions.canRoll === false,
      "Player should be able to roll."
    );
  });

  it("should correctly change the game phase from setup to main", () => {
    catan.turns = 4;
    catan.changePhase();
    assertEquals(catan.phase, "setup");
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

    assert(
      newResourceCount > initialResourceCount,
      "Player should receive resources after building a settlement."
    );

    const vertices = catan.getOccupiedVertices();
    assertEquals(vertices, [{ id: "v0,0|1,-1|1,0", color: "red" }]);
  });

  it("should change the phase to main", () => {
    catan.turns = 16;
    catan.changePhase();
    assertEquals(catan.phase, "main");
  });

  it("should be able to roll", () => {
    catan.turns = 16;
    catan.changePhase();
    assertEquals(catan.phase, "main");
    catan.players[0] = new Player("p1", "Adil", "red");
    catan.canRoll("p1");
  });
});

describe("buildSettlement ", () => {
  let catan: Catan;

  beforeEach(() => {
    catan = new Catan();
    catan.mockGame();
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
    assertEquals(settlement2?.occupiedBy(), "p2");
    assertEquals(settlement1?.occupiedBy(), road1?.occupiedBy());
    assertEquals(settlement2?.occupiedBy(), road2?.occupiedBy());
    assert(settlement1?.isOccupied());
    assert(settlement2?.isOccupied());
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

  it("should be false if the there are no connected edges", () => {
    catan.turns = 0;
    const settlementId = "v0,-1|0,0|1,-1";
    const vertex = catan.board.vertices.get(settlementId) || {
      connectedVertices: "",
    };
    catan.phase = "main";
    vertex.connectedVertices = "";

    const canBuild = catan.canBuildInitialSettlement(settlementId);

    assert(canBuild);

    const vertex2 = catan.board.vertices.get(settlementId) || {
      connectedEdges: "",
    };
    vertex2.connectedEdges = "";

    const canBuild2 = catan.validateBuildSettlement(settlementId, "p1");

    assertFalse(canBuild2);
  });
});

describe("buildRoad", () => {
  let catan: Catan;

  beforeEach(() => {
    catan = new Catan();
    catan.mockGame();
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

    catan.phase = "main";
    catan.buildSettlement(settlementId);
    catan.board.vertices.get(settlementId);
    catan.buildRoad(roadId1);

    catan.currentPlayerIndex = 0;
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
});
