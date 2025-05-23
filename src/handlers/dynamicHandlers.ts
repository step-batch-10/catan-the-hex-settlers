import { Context, Next } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import _ from 'lodash';
import { TradeResources, TradeStatus } from '../types.ts';
import { Catan } from '../models/catan.ts';

export const serveGameState = (ctx: Context): Response => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const gameState = game.getGameState(playerId);

  return ctx.json(gameState);
};

export const rollDice = (ctx: Context): Response => {
  const game = ctx.get('game');
  const rolled = game.rollDice();

  return ctx.json({ ...rolled });
};

export const canRoll = (ctx: Context): Response => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const canRoll = game.canRoll(playerId);

  return ctx.json({ canRoll });
};

export const serveGameData = async (
  ctx: Context,
  next: Next,
): Promise<Response | void> => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const gameData = game.getGameData(playerId);

  if (gameData.hasWon) return await next();

  return ctx.json(gameData);
};

export const buildSettlement = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');
  const { id } = await ctx.req.parseBody();
  game.buildSettlement(id);

  return ctx.json(true);
};

export const buildRoad = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');
  const { id } = await ctx.req.parseBody();
  game.buildRoad(id);

  return ctx.json(true);
};

export const canBuildRoad = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const { id } = await ctx.req.parseBody();

  const canBuild = game.validateBuildRoad(id, playerId);

  return ctx.json({ canBuild });
};

export const canBuildSettlement = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const { id } = await ctx.req.parseBody();
  const canBuild = game.validateBuildSettlement(id, playerId);

  return ctx.json({ canBuild });
};

export const handleBankTrade = async (ctx: Context): Promise<Response> => {
  const tradeResources: TradeResources = await ctx.req.json();
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const player = _.find(game.players, { id: playerId });

  game.trades.openNewTrade('bank', player, tradeResources);

  return ctx.json({ status: 'ok' });
};

export const handleChangeTurn = (ctx: Context): Response => {
  const game = ctx.get('game');
  game.changeTurn();

  return ctx.json(game);
};

export const handleBuyDevCards = (ctx: Context): Response => {
  const playerId = getCookie(ctx, 'player-id');
  const game = ctx.get('game');
  const outcome = game.buyDevCard(playerId);

  return ctx.json(outcome);
};

export const serveAllPositions = (ctx: Context): Response => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const pos = game.getAvailableBuilds(playerId);
  const settlements = pos.get('settlements');
  const cities = pos.get('cities');
  const roads = pos.get('roads');

  return ctx.json({
    settlements: [...settlements],
    roads: [...roads],
    cities: [...cities],
  });
};

export const validateRobberPlacement = async (
  ctx: Context,
): Promise<Response> => {
  const game = ctx.get('game');
  const { id } = await ctx.req.parseBody();
  const isValid = game.validateRobberPosition(id);

  return ctx.json({ isValid });
};

export const updateRobberPosition = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');

  const { id } = await ctx.req.parseBody();
  game.blockResource(id);

  return ctx.text('ok');
};

export const redirectToResults = (ctx: Context): Response => {
  return ctx.redirect('/results.html', 303);
};

export const serveResults = (ctx: Context): Response => {
  const game = ctx.get('game');
  const results = game.getResults();

  return ctx.json([...results]);
};

export const addPlayerToGame = async (ctx: Context) => {
  const sessions = ctx.get('sessions');
  const { name } = await ctx.req.parseBody();
  const { gameId, playerId } = sessions.joinGame(name);
  setCookie(ctx, 'game-id', gameId);
  setCookie(ctx, 'player-id', playerId);

  return ctx.redirect('/waiting.html', 303);
};

export const gameStatus = (ctx: Context) => {
  const sessions = ctx.get('sessions');
  const gameId = getCookie(ctx, 'game-id');
  const isGameReady = sessions.getGameStatus(gameId);

  return ctx.json({ isGameReady });
};

export const isPublicResource = (path: string) => {
  const publicPaths = new Set([
    '/',
    '/index.html',
    '/joinGame',
    '/css/index.css',
    '/images/catan-bg.png',
  ]);
  return publicPaths.has(path);
};

export const authenticate = async (ctx: Context, next: Next) => {
  const gameId = getCookie(ctx, 'game-id');
  const playerId = getCookie(ctx, 'player-id');

  return isPublicResource(ctx.req.path) || (gameId && playerId)
    ? await next()
    : ctx.redirect('/index.html', 303);
};

export const redirectToLogin = (ctx: Context): Response => {
  deleteCookie(ctx, 'player-id');
  deleteCookie(ctx, 'game-id');

  return ctx.redirect('/', 303);
};

export const playRoadBuilding = (ctx: Context): Response => {
  const game = ctx.get('game');
  game.playRoadBuilding();

  return ctx.json(true);
};

export const playMonopoly = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');
  const { resource } = await ctx.req.parseBody();
  console.log(resource, 'resorce for monopoly');
  game.playMonopoly(resource);

  return ctx.json(true);
};

export const handlePlayerTrade = async (ctx: Context): Promise<Response> => {
  const tradeResources: TradeResources = await ctx.req.json();
  const game: Catan = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const player = _.find(game.players, { id: playerId });
  const trade = game.trades.openNewTrade(
    'player',
    player,
    tradeResources,
  ) as TradeStatus;

  game.notifications.tradeNotification(trade);

  return ctx.json(true);
};

export const handleAcceptPlayerTrade = (ctx: Context): Response => {
  const game: Catan = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const player = _.find(game.players, { id: playerId });

  const closedTrade = game.trades.closeTrade(player) as TradeStatus;
  game.notifications.expireNotification(closedTrade.tradeId);

  return ctx.json(true);
};
