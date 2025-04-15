import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';

export const createApp = () => {
  const app = new Hono();

  app.get('/ok', (c) => c.text('ok'));
  app.get('*', serveStatic({ root: './public' }));

  return app;
};
