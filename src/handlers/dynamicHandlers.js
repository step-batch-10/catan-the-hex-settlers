export const servePlayersList = (ctx) => {
  const gameData = ctx.get('gameData');
  const players = gameData.players;

  return ctx.json(players);
};
