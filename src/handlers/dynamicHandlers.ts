import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

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

export const rollDiceHandler = (ctx: Context): Response => {
  const game = ctx.get('game');
  const rolled = game.rollDice();

  return ctx.json({ rolled });
};

export const canRoll = (ctx: Context): Response => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const canRoll = game.canRoll(playerId);

  return ctx.json({ canRoll });
};

export const serveGameData = (ctx: Context): Response => {
  const game = ctx.get('game');
  const gameData = game.getGameData();

  return ctx.json(gameData);
};

export const buildAtVertex = async (ctx: Context): Promise<Response> => {
  const game = ctx.get('game');
  const { id } = await ctx.req.parseBody();
  game.buildSettlement(id);

  return ctx.json(true);
};

export const buildAtEdge = async (ctx: Context): Promise<Response> => {
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
