import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { logger } from 'hono/logger';
import type { Context, Next } from 'hono';
import {
  addPlayerToGame,
  authenticate,
  buildRoad,
  buildSettlement,
  canBuildRoad,
  canBuildSettlement,
  canRoll,
  gameStatus,
  handleAcceptPlayerTrade,
  handleBankTrade,
  handleBuyDevCards,
  handleChangeTurn,
  handlePlayerTrade,
  playMonopoly,
  playRoadBuilding,
  redirectToLogin,
  redirectToResults,
  rollDice,
  serveAllPositions,
  serveGameData,
  serveGameState,
  serveResults,
  updateRobberPosition,
  validateRobberPlacement,
} from './handlers/dynamicHandlers.ts';
import { SessionStore } from './models/sessions.ts';
import { getCookie } from 'hono/cookie';

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
  gameApp.post('/trade/bank', handleBankTrade);
  gameApp.post('/trade/player', handlePlayerTrade);
  gameApp.post('/trade/player/accept', handleAcceptPlayerTrade);
  gameApp.patch('/buy/dev-card', handleBuyDevCards);
  gameApp.post('/build/edge', buildRoad);
  gameApp.post('/play/road-building', playRoadBuilding);
  gameApp.post('/play/monopoly', playMonopoly);
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
