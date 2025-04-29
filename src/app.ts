import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { logger } from 'hono/logger';
import type { Context, Next } from 'hono';
import {
  addPlayerToGame,
  authenticate,
  bankTradeHandler,
  buildRoad,
  buildSettlement,
  canBuildRoad,
  canBuildSettlement,
  canRoll,
  gameStatus,
  handleBuyDevCards,
  handleChangeTurn,
  redirectToLogin,
  playRoadBuilding,
  redirectToResults,
  rollDice,
  serveAllPositions,
  serveGameData,
  serveGameState,
  serveResults,
  updateRobberPosition,
  validateRobberPlacement,
} from './handlers/dynamicHandlers.ts';
import { Player } from './models/player.ts';
import { Board } from './models/board.ts';
import { SessionStore } from './models/sessions.ts';
import { getCookie } from 'hono/cookie';

type Game = {
  players: Player[];
  board: Board;
};

const injectGame = () => async (c: Context, next: Next) => {
  const sessions = c.get('sessions');
  const gameId = getCookie(c, 'game-id');
  c.set('game', sessions.games.get(gameId));
  await next();
};

const injectSessions =
  (sessions: SessionStore) => async (c: Context, next: Next) => {
    c.set('sessions', sessions);
    await next();
  };

const gameRoutes = (): Hono => {
  const gameApp = new Hono();

  gameApp.use(injectGame());
  gameApp.get('/gameState', serveGameState);
  gameApp.get('/results', serveResults);
  gameApp.get('/gameData', serveGameData, redirectToResults);
  gameApp.post('dice/roll', rollDice);
  gameApp.post('/build/vertex', buildSettlement);
  gameApp.post('/changeTurn', handleChangeTurn);
  gameApp.post('/trade/bank', bankTradeHandler);
  gameApp.patch('/buy/dev-card', handleBuyDevCards);
  gameApp.post('/build/edge', buildRoad);
  gameApp.post('/play/roadBuilding', playRoadBuilding);
  gameApp.get('/dice/can-roll', canRoll);
  gameApp.post('/can-place-robber', validateRobberPlacement);
  gameApp.post('/moveRobber', updateRobberPosition);
  gameApp.post('/can-build/vertex', canBuildSettlement);
  gameApp.post('/can-build/edge', canBuildRoad);
  gameApp.get('/possible-positions', serveAllPositions);
  gameApp.post('exit', redirectToLogin);

  return gameApp;
};

export const createApp = (sessions: SessionStore): Hono => {
  const app = new Hono();

  app.use(logger());
  app.use('*', authenticate);
  app.use(injectSessions(sessions));
  app.post('/joinGame', addPlayerToGame);
  app.get('/gameStatus', gameStatus);
  app.route('/game', gameRoutes());
  app.get('*', serveStatic({ root: './public' }));

  return app;
};
