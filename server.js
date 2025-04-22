import { createApp } from './src/app.js';
import { Board } from './src/models/board.ts';
import { Catan } from './src/models/catan.ts';
import { Player } from './src/models/player.ts';
import _ from 'lodash';

const main = (port) => {
  const players = [];
  players.push(new Player('p1', 'Adil', 'red'));
  players.push(new Player('p2', 'Aman', 'blue'));
  players.push(new Player('p3', 'Vineet', 'orange'));
  players.push(new Player('p4', 'Shalu', 'white'));
  const board = new Board();
  board.createBoard();
  const game = new Catan('game123', players, board, _.random);

  Deno.serve({ port }, createApp(game).fetch);
};

main(Deno.args[0] || 3000);
