import { Board } from './board.ts';
import { Player } from './player.ts';
import _ from 'lodash';

type GamePhase = 'setup' | 'main' | 'end';

export class Catan {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  winner: string | null;
  diceRoll: [number, number] | [];
  board: Board;

  constructor() {
    this.gameId = 'game123';
    this.players = [];
    this.currentPlayerIndex = 0;
    this.phase = 'setup';
    this.winner = null;
    this.diceRoll = [1, 1];
    this.board = new Board();
  }

  mockGame(): this {
    this.players.push(new Player('p1', 'Adil', 'red'));
    this.players.push(new Player('p2', 'Aman', 'blue'));
    this.players.push(new Player('p3', 'Vineet', 'orange'));
    this.players.push(new Player('p4', 'Shalu', 'white'));
    this.board.createBoard();
    return this;
  }

  changeTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
  }

  rollDice(): [number, number] {
    const dice1 = _.random(1, 6);
    const dice2 = _.random(1, 6);
    this.diceRoll = [dice1, dice2];
    this.changeTurn();
    return this.diceRoll;
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
    const canRoll = this.players[this.currentPlayerIndex].id === playerId;
    return { canRoll };
  }

  getGameState(playerId: string): object {
    const players = this.getPlayersInfo(playerId);
    const board = this.board.getBoard();
    const currentPlayerId = this.players[this.currentPlayerIndex].id;
    const { gameId, diceRoll } = this;
    const availableActions = this.getAvailableActions(playerId);

    const playersData = { playerId, players, currentPlayerId };
    return { gameId, diceRoll, board, availableActions, ...playersData };
  }
}
