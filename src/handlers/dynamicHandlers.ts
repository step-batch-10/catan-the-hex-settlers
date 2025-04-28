import { Context, Next } from 'hono';

import { getCookie, setCookie } from 'hono/cookie';
import _ from 'lodash';
import { TradeResources } from '../types.ts';
import { updateResources } from '../handlerHelpers.ts';

export const serveGameState = (ctx: Context): Response => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const gameState = game.getGameState(playerId);

  return ctx.json(gameState);
};

export const serveGamePage = (ctx: Context): Response => {
  setCookie(ctx, 'player-id', ctx.req.param('playerId'));
  return ctx.redirect('/game.html', 303);
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

export const maritimeHandler = async (ctx: Context): Promise<Response> => {
  const tradeResources: TradeResources = await ctx.req.json();
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const player = _.find(game.players, { id: playerId });

  updateResources(player, tradeResources);

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
  const roads = pos.get('roads');

  return ctx.json({ settlements: [...settlements], roads: [...roads] });
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
  return ctx.redirect('/results', 303);
};
