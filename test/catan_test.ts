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
    assertEquals(freshGame.diceRoll.length, 0);
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
});
