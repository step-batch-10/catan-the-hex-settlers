import { Context } from 'hono';

export const servePlayersList = (ctx: Context): Response => {
  const gameData = ctx.get('gameData');
  const players = gameData.players;

  return ctx.json(players);
};

export const rollDice = (ctx: Context) => {
  const gameData = ctx.get('gameData');
  const [dice1, dice2] = gameData.diceRoll;
  return ctx.json({ dice1, dice2 }, 200);
};

export const canRoll = (ctx: Context) => {
  const playerId = ctx.req.param('playerId');
  const gameData = ctx.get('gameData');
  if (playerId === gameData.playerId) {
    const isRolled = !gameData.availableActions.canRoll;
    return ctx.json({ isRolled });
  }
  return ctx.json({ isRolled: true });
};
