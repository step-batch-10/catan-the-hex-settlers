import { assertEquals, assertThrows } from "assert";
import { Player } from "../src/models/player.ts";
import { describe, it } from "testing/bdd";
import { TradeResources } from "../src/types.ts";
import {
  addResources,
  decrementResources,
  updateResources,
} from "../src/handlerHelpers.ts";

describe("addResources", () => {
  it("should add new resources to the player", () => {
    const player1 = new Player("p1", "adhil", "blue");
    const tradeResource1: TradeResources = {
      incomingResources: {
        lumber: 1,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    const { incomingResources } = tradeResource1;

    addResources(incomingResources, player1);

    assertEquals(player1.resources, {
      lumber: 1,
      brick: 0,
      wool: 0,
      grain: 0,
      ore: 0,
    });

    const player2 = new Player("p2", "Shalu", "green");

    const tradeResource2: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 4,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    addResources(tradeResource2.incomingResources, player2);

    assertEquals(player2.resources, {
      lumber: 0,
      brick: 0,
      wool: 4,
      grain: 0,
      ore: 0,
    });
  });

  it("should add to existing resource to the player", () => {
    const player1 = new Player("p1", "adhil", "blue");
    player1.resources.brick = 4;

    const tradeResource1: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 3,
        wool: 0,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    const { incomingResources } = tradeResource1;

    addResources(incomingResources, player1);

    assertEquals(player1.resources, {
      lumber: 0,
      brick: 7,
      wool: 0,
      grain: 0,
      ore: 0,
    });

    const player2 = new Player("p2", "Shalu", "green");
    player2.resources.ore = 2;

    const tradeResource2: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 2,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    addResources(tradeResource2.incomingResources, player2);

    assertEquals(player2.resources, {
      lumber: 0,
      brick: 0,
      wool: 0,
      grain: 0,
      ore: 4,
    });
  });

  it("should add to existing resource without changing any other resource count", () => {
    const player1 = new Player("p1", "adhil", "blue");
    player1.resources.brick = 4;

    const tradeResource1: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 2,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    const { incomingResources } = tradeResource1;

    addResources(incomingResources, player1);

    assertEquals(player1.resources, {
      lumber: 0,
      brick: 4,
      wool: 0,
      grain: 2,
      ore: 0,
    });

    const player2 = new Player("p2", "Shalu", "green");
    player2.resources.ore = 2;

    const tradeResource2: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 3,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    addResources(tradeResource2.incomingResources, player2);

    assertEquals(player2.resources, {
      lumber: 0,
      brick: 0,
      wool: 3,
      grain: 0,
      ore: 2,
    });
  });
});

describe("decrementResources", () => {
  it("should decrement resources from the user", () => {
    const player1 = new Player("p1", "adhil", "blue");
    player1.resources.brick = 4;

    const tradeResource1: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 3,
        wool: 0,
        grain: 0,
        ore: 0,
      },
    };

    const { outgoingResources } = tradeResource1;

    decrementResources(outgoingResources, player1);

    assertEquals(player1.resources, {
      lumber: 0,
      brick: 1,
      wool: 0,
      grain: 0,
      ore: 0,
    });

    const player2 = new Player("p2", "Shalu", "green");
    player2.resources.ore = 2;

    const tradeResource2: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 1,
      },
    };

    decrementResources(tradeResource2.outgoingResources, player2);

    assertEquals(player2.resources, {
      lumber: 0,
      brick: 0,
      wool: 0,
      grain: 0,
      ore: 1,
    });
  });

  it("should return error if resulted resource count is less than zero", () => {
    const player1 = new Player("p1", "adhil", "blue");
    player1.resources.brick = 4;

    const tradeResource1: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 2,
        grain: 0,
        ore: 0,
      },
    };

    const { outgoingResources } = tradeResource1;

    assertThrows(
      () => decrementResources(outgoingResources, player1),
      Error,
      "player don't have enough resources"
    );

    const player2 = new Player("p2", "Shalu", "green");
    player2.resources.ore = 2;

    const tradeResource2: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 3,
        grain: 0,
        ore: 0,
      },
    };

    assertThrows(
      () => decrementResources(tradeResource2.outgoingResources, player1),
      Error,
      "player don't have enough resources"
    );
  });
});

describe("updateResources", () => {
  it("should update the player resource count", () => {
    const player = new Player("p2", "Shalu", "green");
    player.resources.wool = 3;

    const tradeResource: TradeResources = {
      incomingResources: {
        lumber: 1,
        brick: 0,
        wool: 0,
        grain: 1,
        ore: 0,
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 3,
        grain: 0,
        ore: 0,
      },
    };

    updateResources(player, tradeResource);

    assertEquals(player.resources, {
      lumber: 1,
      brick: 0,
      wool: 0,
      grain: 1,
      ore: 0,
    });
  });
});
