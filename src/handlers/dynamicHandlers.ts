import { Context } from 'hono';

export const servePlayersList = (ctx: Context): Response => {
  const gameData = ctx.get('gameData');
  const players = gameData.players;

  return ctx.json(players);
};
