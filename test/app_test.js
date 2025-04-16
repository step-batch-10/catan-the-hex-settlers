import { assertEquals } from "jsr:@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { createApp } from "../src/app.js";

describe("app test", () => {
  it("should give status code 200", async () => {
    const app = createApp();
    const response = await app.request("/ok");
    assertEquals(response.status, 200);
  });

  it("should give empty list of players", async () => {
    const gameData = { players: [] };
    const app = createApp(gameData);
    const response = await app.request("/players");
    assertEquals(await response.json(), []);
  });

  it("should give list of 2 players", async () => {
    const gameData = {
      players: [
        {
          id: "p1",
          name: "vineet",
          color: "blue",
          victoryPoints: 5,
          resources: { wood: 1, brick: 2, sheep: 0, wheat: 1, ore: 0 },
          roads: ["e12", "e13"],
          settlements: ["v5", "v19"],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false,
        },
        {
          id: "p1",
          name: "pavani",
          color: "green",
          victoryPoints: 5,
          resources: { wood: 1, brick: 2, sheep: 0, wheat: 1, ore: 0 },
          roads: ["e12", "e13"],
          settlements: ["v5", "v19"],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false,
        },
      ],
    };
    const app = createApp(gameData);
    const response = await app.request("/players");
    assertEquals(await response.json(), gameData.players);
  });
});
