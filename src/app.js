import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { serveGamePage, serveGameState } from "./handlers/dynamicHandlers.ts";

const inject = (game) => async (c, next) => {
  c.set("game", game);
  await next();
};

const gameRoutes = (game) => {
  const gameApp = new Hono();

  gameApp.use(inject(game));
  gameApp.get("/gameState", serveGameState);
  gameApp.get("/:playerId", serveGamePage);
  return gameApp;
};

export const createApp = (game) => {
  const app = new Hono();

  app.use(logger());
  app.get("/ok", (c) => c.text("ok"));

  app.route("/game", gameRoutes(game));

  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
