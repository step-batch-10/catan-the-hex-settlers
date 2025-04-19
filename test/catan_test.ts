import { assertEquals, assert } from 'assert';
import { describe, it, beforeEach } from 'testing/bdd';
import { Catan } from '../src/models/catan.ts';
import { Player } from '../src/models/player.ts';
import { Hex } from '../src/models/hex.ts';

interface GameState {
  gameId: string;
  playerId: string;
  players: { me: Player; others: Player[] };
  board: { hexes: Hex[] };
}

interface AbstractPlayerData {
  id: string;
  name: string;
  color: string;
  resources: number;
  roads: string[];
  settlements: string[];
  cities: string[];
  devCards: number;
  hasLargestArmy: boolean;
  hasLongestRoad: boolean;
  victoryPoints: number;
}

let game: Catan;

beforeEach(() => {
  game = new Catan();
  game.mockGame();
});

describe('Catan', () => {
  it('should initialize correctly', () => {
    const freshGame = new Catan();

    assertEquals(freshGame.gameId, 'game123');
    assertEquals(freshGame.players.length, 0);
    assertEquals(freshGame.currentPlayerIndex, 0);
    assertEquals(freshGame.phase, 'setup');
    assertEquals(freshGame.winner, null);
    assertEquals(freshGame.diceRoll.length, 2);
    assert(freshGame.board !== undefined);
  });

  it('should create mock players and board', () => {
    assertEquals(game.players.length, 4);
    assertEquals(game.players[0].name, 'Adil');
    assert(game.board.hexes.length > 0);
  });

  it('should change turn correctly', () => {
    const prev = game.currentPlayerIndex;
    game.changeTurn();
    assertEquals(game.currentPlayerIndex, (prev + 1) % game.players.length);
  });

  it('should roll two dice with values 1-6', () => {
    const result = game.rollDice();
    assertEquals(result.length, 2);
    assert(result[0] >= 1 && result[0] <= 6);
    assert(result[1] >= 1 && result[1] <= 6);
  });

  it('should abstract player data with resource and dev card totals', () => {
    const player: Player = game.players[0];
    player.resources.wood = 2;
    player.devCards.knight = 3;

    const data = game.abstractPlayerData(player) as AbstractPlayerData;
    assertEquals(data.resources, 2);
    assertEquals(data.devCards, 3);
    assertEquals(data.name, 'Adil');
  });

  it('should return correct player info split into me and others', () => {
    const playerId = 'p2';
    const { me, others } = game.getPlayersInfo(playerId);

    assertEquals(me.id, 'p2');
    assertEquals(others.length, 3);
  });

  it('should return full game state with board and player info', () => {
    const state = game.getGameState('p1') as GameState;

    assertEquals(state.gameId, 'game123');
    assertEquals(state.playerId, 'p1');
    assertEquals(state.players.me.id, 'p1');
    assertEquals(state.players.others.length, 3);
    assert(state.board.hexes.length > 0);
  });

    it('should correctly determine if player can roll (not during setup)', () => {
      game.turns = 13; // outside setup phase
      const currentPlayer = game.players[game.currentPlayerIndex];
      const canRoll = game.canRoll(currentPlayer.id);
      assertEquals(canRoll, true);
    });

    it('should prevent rolling during initial setup', () => {
      game.turns = 5; // still within setup phase
      const currentPlayer = game.players[game.currentPlayerIndex];
      const canRoll = game.canRoll(currentPlayer.id);
      assertEquals(canRoll, false);
    });

    it('should allow building settlement only on even turns by current player', () => {
      game.turns = 6; // even turn
      const currentPlayer = game.players[game.currentPlayerIndex];
      assertEquals(game.canBuildSettlement(currentPlayer.id), true);

      game.turns = 7; // odd turn
      assertEquals(game.canBuildSettlement(currentPlayer.id), false);
    });

    it('should allow building road only on odd turns by current player', () => {
      game.turns = 7; // odd turn
      const currentPlayer = game.players[game.currentPlayerIndex];
      assertEquals(game.canBuildRoad(currentPlayer.id), true);

      game.turns = 8; // even turn
      assertEquals(game.canBuildRoad(currentPlayer.id), false);
    });

    it('should build a road and increment turn count', () => {
      const currentPlayer = game.players[game.currentPlayerIndex];
      const [edgeId] = Array.from(game.board.edges.keys());
      const prevTurn = game.turns;

      const success = game.buildRoad(edgeId);

      assertEquals(success, true);
      assertEquals(currentPlayer.roads.includes(edgeId), true);
      assertEquals(game.turns, prevTurn + 1);
    });

    it('should build a settlement and increment turn count', () => {
      const currentPlayer = game.players[game.currentPlayerIndex];
      const [vertexId] = Array.from(game.board.vertices.keys());
      const prevTurn = game.turns;

      const success = game.buildSettlement(vertexId);

      assertEquals(success, true);
      assertEquals(currentPlayer.settlements.includes(vertexId), true);
      assertEquals(game.turns, prevTurn + 1);
    });

    it('should return correct available actions for current player', () => {
      const currentPlayer = game.players[game.currentPlayerIndex];
      game.turns = 5;

      const actions = game.getAvailableActions(currentPlayer.id);

      assertEquals(actions.canRoll, false);
    });
});
