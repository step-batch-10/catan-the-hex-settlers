import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

export const serveGameState = (ctx: Context): Response => {
  const game = ctx.get('game');
  const playerId = getCookie(ctx, 'player-id');
  const gameState = game.getGameState(playerId);

  return ctx.json(gameState);
};

export const serveGamePage = (ctx: Context): Response => {
  console.log(ctx.req.param('playerId'));
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
  const canRoll = game.players[game.currentPlayerIndex].id === playerId;

  return ctx.json({ canRoll });
};
