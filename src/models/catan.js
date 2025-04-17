import { Board } from './board.ts';
import { Player } from './player.ts';
import _ from 'lodash';

export class Catan {
  constructor() {
    this.gameId = 'game123';
    this.players = [];
    this.currentPlayerIndex = 0;
    this.phase = 'setup';
    this.winner = null;
    this.diceRoll = [];
    this.board = new Board();
  }

  mockGame() {
    this.players.push(new Player('p1', 'Adil', 'red'));
    this.players.push(new Player('p2', 'Aman', 'blue'));
    this.players.push(new Player('p3', 'Vineet', 'orange'));
    this.players.push(new Player('p4', 'Shalu', 'white'));
    this.board.createBoard();
    return this;
  }

  changeTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
  }

  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    this.diceRoll = [dice1, dice2];
    return this.diceRoll;
  }

  abstractPlayerData(player) {
    const data = player.getPlayerData();
    const resources = _.sum(_.values(data.resources));
    const devCards = _.sum(_.values(data.devCards));

    return { ...data, resources, devCards };
  }

  getPlayersInfo(playerId) {
    const [[player], others] = _.partition(
      this.players,
      (player) => player.id === playerId,
    );

    const me = player.getPlayerData();
    const othersData = others.map((other) => this.abstractPlayerData(other));
    return { me, others: othersData };
  }

  getGameState(playerId) {
    const players = this.getPlayersInfo(playerId);
    const board = this.board.getBoard();
    const currentPlayerId = this.players[this.currentPlayerIndex].id;
    const { gameId, diceRoll } = this;

    return { gameId, diceRoll, playerId, currentPlayerId, players, board };
  }
}
