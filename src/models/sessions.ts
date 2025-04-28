import _ from 'lodash';
import { Catan } from './catan.ts';
import { Player } from './player.ts';
import { defaultSlot, DevelopmentCards, Slot } from '../types.ts';
import { Board } from './board.ts';

export class SessionStore {
  games: Map<string, Catan>;
  slot: Slot;
  slotSize: number;
  generator: Generator<string>;

  constructor() {
    this.games = new Map();
    this.slot = defaultSlot();
    this.slotSize = 0;
    this.generator = this.generateGameId();
  }

  *generateGameId() {
    let id = 1000;
    while (true) {
      yield String(id);
      id++;
    }
  }

  getGameStatus(gameId: string): boolean {
    return this.games.has(gameId);
  }

  createPlayerInstances(players: Slot['players']): Player[] {
    return players.map((player) => {
      const { id, name, color } = player;
      return new Player(id, name, color);
    });
  }

  refreshSlot() {
    this.slot = defaultSlot();
    this.slotSize = 0;
  }

  createGame(): void {
    const gameId = this.slot.gameId;
    const players = this.createPlayerInstances(this.slot.players);
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
    this.games.set(gameId, new Catan(gameId, players, board, _.random, supply));
    this.refreshSlot();
  }

  joinGame(name: string): { gameId: string; playerId: string } {
    if (this.slotSize === 0) this.slot.gameId = this.generator.next().value;

    const player = this.slot.players[this.slotSize];
    player.name = name;
    this.slotSize++;
    const gameId = this.slot.gameId;

    if (this.slotSize === 4) this.createGame();
    return { gameId, playerId: player.id };
  }
}
