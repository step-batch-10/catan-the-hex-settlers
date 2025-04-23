import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { logger } from 'hono/logger';
import type { Context, Next } from 'hono';

import {
  buildRoad,
  buildSettlement,
  canBuildRoad,
  canBuildSettlement,
  canRoll,
  handleChangeTurn,
  maritimeHandler,
  rollDice,
  serveGameData,
  serveGamePage,
  serveGameState,
} from './handlers/dynamicHandlers.ts';
import { Player } from './models/player.ts';
import { Board } from './models/board.ts';

type Game = {
  players: Player[];
  board: Board;
};

const inject = (game: Game) => async (c: Context, next: Next) => {
  c.set('game', game);
  await next();
};

const gameRoutes = (game: Game): Hono => {
  const gameApp = new Hono();

  gameApp.use(inject(game));
  gameApp.get('/gameState', serveGameState);
  gameApp.get('/gameData', serveGameData);
  gameApp.post('/roll-dice', rollDice);
  gameApp.post('/build/vertex', buildSettlement);
  gameApp.post('/changeTurn', handleChangeTurn);
  gameApp.post('/trade/maritime', maritimeHandler);
  gameApp.post('/build/edge', buildRoad);
  gameApp.get('/dice/can-roll', canRoll);
  gameApp.post('/can-build/vertex', canBuildSettlement);
  gameApp.post('/can-build/edge', canBuildRoad);
  gameApp.get('/:playerId', serveGamePage);

  return gameApp;
};

export const createApp = (game: Game): Hono => {
  const app = new Hono();

  app.use(logger());
  app.route('/game', gameRoutes(game));
  app.get('*', serveStatic({ root: './public' }));

  return app;
};
