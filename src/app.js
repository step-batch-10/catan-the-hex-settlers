import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { logger } from 'hono/logger';
import {
  buildRoad,
  buildSettlement,
  canBuildRoad,
  canBuildSettlement,
  canRoll,
  maritimeHandler,
  rollDice,
  serveGameData,
  serveGamePage,
  serveGameState,
} from './handlers/dynamicHandlers.ts';

const inject = (game) => async (c, next) => {
  c.set('game', game);
  await next();
};

const gameRoutes = (game) => {
  const gameApp = new Hono();

  gameApp.use(inject(game));
  gameApp.get('/gameState', serveGameState);
  gameApp.get('/gameData', serveGameData);
  gameApp.post('/roll-dice', rollDice);
  gameApp.post('/build/vertex', buildSettlement);
  gameApp.post('/trade/maritime', maritimeHandler);
  gameApp.post('/build/edge', buildRoad);
  gameApp.get('/dice/can-roll', canRoll);
  gameApp.post('/can-build/vertex', canBuildSettlement);
  gameApp.post('/can-build/edge', canBuildRoad);
  gameApp.get('/:playerId', serveGamePage);

  return gameApp;
};

export const createApp = (game) => {
  const app = new Hono();

  app.use(logger());
  app.route('/game', gameRoutes(game));
  app.get('*', serveStatic({ root: './public' }));

  return app;
};
