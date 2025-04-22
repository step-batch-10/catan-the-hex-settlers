import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { logger } from 'hono/logger';
import {
  buildAtEdge,
  buildAtVertex,
  canBuildRoad,
  canBuildSettlement,
  canRoll,
  rollDiceHandler,
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
  gameApp.post('/roll-dice', rollDiceHandler);
  gameApp.post('/build/vertex', buildAtVertex);
  gameApp.post('/build/edge', buildAtEdge);
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
