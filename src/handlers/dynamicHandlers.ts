import { Context } from 'hono';

export const servePlayersList = (ctx: Context): Response => {
  const gameData = ctx.get('gameData');
  const players = gameData.players;

  return ctx.json(players);
};

const randomNumber = () => Math.floor(Math.random() * 6) + 1;

export const rollDice = (ctx: Context) => {
  const dice1 = randomNumber();
  const dice2 = randomNumber();
  return ctx.json({ dice1, dice2 });
};
