import { Resources, TradeResources } from '../src/types.ts';
import { Player } from './models/player.ts';

export const decrementResources = (
  outgoingResources: Resources,
  player: Player,
) => {
  for (const [resource, count] of Object.entries(outgoingResources)) {
    const resultedCount = player.resources[resource] - count;
    if (resultedCount < 0) {
      throw new Error("player don't have enough resources");
    }
    player.resources[resource] -= count;
  }
};

export const addResources = (incomingResources: Resources, player: Player) => {
  Object.entries(incomingResources).forEach(([resource, count]) => {
    player.resources[resource] += count;
  });
};

export const updateResources = (player: Player, resources: TradeResources) => {
  const { incomingResources, outgoingResources } = resources;
  addResources(incomingResources, player);
  decrementResources(outgoingResources, player);
};
