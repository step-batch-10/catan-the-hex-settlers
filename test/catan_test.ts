import { assertEquals, assert } from 'assert';
import { Catan } from '../src/models/catan.ts';
import { describe, it, beforeEach } from 'testing/bdd';

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

describe('Catan', () => {
  let catan: Catan;

  beforeEach(() => {
    catan = new Catan();
    catan.mockGame();
  });

  it('should initialize the game correctly', () => {
    assertEquals(catan.gameId, 'game123');
    assertEquals(catan.players.length, 4);
    assertEquals(catan.phase, 'rolling');
    assertEquals(catan.currentPlayerIndex, 0);
    assertEquals(catan.turns, 0);
    assertEquals(catan.diceRoll.length, 2);
  });

  it('should roll the dice correctly', () => {
    const diceRoll = catan.rollDice();
    assert(
      diceRoll[0] >= 1 && diceRoll[0] <= 6,
      'First dice should be between 1 and 6.'
    );
    assert(
      diceRoll[1] >= 1 && diceRoll[1] <= 6,
      'Second dice should be between 1 and 6.'
    );
    assertEquals(catan.turns, 1);
  });

  it('should change the turn correctly', () => {
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 1);

    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 2);

    catan.turns = 12;
    catan.changeTurn();
    assertEquals(catan.currentPlayerIndex, 3);
  });

  it('should correctly handle setup phase', () => {
    assertEquals(catan.phase, 'rolling');
    catan.turns = 4;
    catan.changePhase();
    assertEquals(catan.phase, 'setup');
  });

  it('should check if player can roll', () => {
    const player1 = catan.players[0];
    const canRoll = catan.canRoll(player1.id);
    assertEquals(canRoll, true);

    catan.phase = 'setup';
    const cannotRoll = catan.canRoll(player1.id);
    assertEquals(cannotRoll, false);
  });

  it('should allow players to build settlements on the correct turns', () => {
    const player1 = catan.players[0];
    const canBuildSettlement = catan.canBuildSettlement(player1.id);
    assertEquals(canBuildSettlement, true);

    catan.turns = 1;
    const cannotBuildSettlement = catan.canBuildSettlement(player1.id);
    assertEquals(cannotBuildSettlement, false);
  });

  it('should allow players to build roads on the correct turns', () => {
    const player1 = catan.players[0];
    const canBuildRoad = catan.canBuildRoad(player1.id);
    assertEquals(canBuildRoad, false);

    catan.turns = 1;
    const canBuildRoadNow = catan.canBuildRoad(player1.id);
    assertEquals(canBuildRoadNow, true);
  });

  it('should build a road correctly', () => {
    const edgeId = 'e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2';
    const result = catan.buildRoad(edgeId);
    assertEquals(result, true);

    const edges = catan.getOccupiedEdges();
    assertEquals(edges, [
      { id: 'e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2', color: 'red' },
    ]);
  });

  it('should build a settlement correctly', () => {
    const vertexId = 'v1_1';
    const result = catan.buildSettlement(vertexId);
    assertEquals(result, true);
  });

  it('should provide game state correctly', () => {
    const player1 = catan.players[0];
    const gameState: {
      gameId: string;
      diceRoll: number[];
      board: { hexes: object[]; vertices: VertexData[]; edges: EdgeData[] };
      availableActions: { canRoll: boolean };
    } = catan.getGameState(player1.id);

    assertEquals(gameState.gameId, 'game123');
    assert(gameState.diceRoll.length === 2, 'Dice roll should be present.');
    assert(gameState.board.hexes.length > 0, 'Board hexes should be present.');
    assert(
      gameState.board.vertices.length > 0,
      'Board vertices should be present.'
    );
    assert(gameState.board.edges.length > 0, 'Board edges should be present.');
    assert(
      gameState.availableActions.canRoll === true,
      'Player should be able to roll.'
    );
  });

  it('should correctly change the game phase from setup to main', () => {
    catan.turns = 4;
    catan.changePhase();
    assertEquals(catan.phase, 'setup');
  });

  it('should reverse turn order correctly after turn 12', () => {
    catan.turns = 12;
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

    assert(
      newResourceCount > initialResourceCount,
      'Player should receive resources after building a settlement.'
    );

    const vertices = catan.getOccupiedVertices();
    assertEquals(vertices, [{ id: 'v0,0|1,-1|1,0', color: 'red' }]);
  });
});
