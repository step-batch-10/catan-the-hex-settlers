import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { logger } from 'hono/logger';
import { rollDice, servePlayersList } from './handlers/dynamicHandlers.ts';

const inject = (gameData) => async (c, next) => {
  c.set('gameData', gameData);
  await next();
};

export const createApp = (gameData) => {
  const app = new Hono();

  app.use(logger());
  app.get('/ok', (c) => c.text('ok'));
  app.use(inject(gameData));
  app.get('/players', servePlayersList);
  app.get('/dice', rollDice);
  app.get('*', serveStatic({ root: './public' }));

  return app;
};
