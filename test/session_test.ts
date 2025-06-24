import { assertEquals } from "assert/equals";
import { describe, it } from "testing/bdd";
import { SessionStore } from "../src/models/sessions.ts";
import { assert } from "assert/assert";
import { assertFalse } from "assert/false";

describe("should create a session", () => {
  it("should return unique id", () => {
    const session = new SessionStore();
    const generator = session.generateGameId();
    assertEquals(generator.next(), { value: "1000", done: false });
    assertEquals(generator.next(), { value: "1001", done: false });
  });

  it("should return a game Instance", () => {
    const sessions = new SessionStore();
    const { gameId, playerId } = sessions.joinGame("A");
    const { gameId: gameId2, playerId: playerId2 } = sessions.joinGame("B");
    const { gameId: gameId3, playerId: playerId3 } = sessions.joinGame("C");
    const { gameId: gameId4, playerId: playerId4 } = sessions.joinGame("D");
    assertEquals(gameId, gameId2);
    assertEquals(gameId3, gameId2);
    assertEquals(gameId3, gameId4);
    assertEquals(playerId, "p1");
    assertEquals(playerId2, "p2");
    assertEquals(playerId3, "p3");
    assertEquals(playerId4, "p4");
  });

  it("should return a game status of true", () => {
    const sessions = new SessionStore();
    const { gameId, playerId } = sessions.joinGame("A");
    const { gameId: gameId2, playerId: playerId2 } = sessions.joinGame("B");
    const { gameId: gameId3, playerId: playerId3 } = sessions.joinGame("C");
    const { gameId: gameId4, playerId: playerId4 } = sessions.joinGame("D");
    assert(sessions.getGameStatus(gameId).isGameReady);
    assert(sessions.getGameStatus(gameId2).isGameReady);
    assert(sessions.getGameStatus(gameId3).isGameReady);
    assert(sessions.getGameStatus(gameId4).isGameReady);
  });

  it("should return a game status - reset players count if 4 players joined", () => {
    const sessions = new SessionStore();
    const { gameId, playerId } = sessions.joinGame("A");
    const { gameId: gameId2, playerId: playerId2 } = sessions.joinGame("B");
    const { gameId: gameId3, playerId: playerId3 } = sessions.joinGame("C");
    const { gameId: gameId4, playerId: playerId4 } = sessions.joinGame("D");

    assertEquals(sessions.getGameStatus(gameId4).playersCount, 0);
  });

  it("should return a game status with players count", () => {
    const sessions = new SessionStore();
    const { gameId, playerId } = sessions.joinGame("A");
    const { gameId: gameId2, playerId: playerId2 } = sessions.joinGame("B");
    const { gameId: gameId3, playerId: playerId3 } = sessions.joinGame("C");

    assertEquals(sessions.getGameStatus(gameId).playersCount, 3);
    assertEquals(sessions.getGameStatus(gameId2).playersCount, 3);
    assertEquals(sessions.getGameStatus(gameId3).playersCount, 3);
  });

  it("should return a game status of false", () => {
    const sessions = new SessionStore();
    const { gameId, playerId } = sessions.joinGame("A");
    const { gameId: gameId2, playerId: playerId2 } = sessions.joinGame("B");
    const { gameId: gameId3, playerId: playerId3 } = sessions.joinGame("C");
    assertEquals(gameId, gameId2);
    assertEquals(gameId3, gameId2);
    assertEquals(playerId, "p1");
    assertEquals(playerId2, "p2");
    assertEquals(playerId3, "p3");
    assertFalse(sessions.getGameStatus(gameId).isGameReady);
    assertFalse(sessions.getGameStatus(gameId2).isGameReady);
    assertFalse(sessions.getGameStatus(gameId3).isGameReady);
  });

  it("should create a two different Games", () => {
    const sessions = new SessionStore();
    const { gameId, playerId } = sessions.joinGame("A");
    const { gameId: gameId2, playerId: playerId2 } = sessions.joinGame("B");
    const { gameId: gameId3, playerId: playerId3 } = sessions.joinGame("C");
    const { gameId: gameId4, playerId: playerId4 } = sessions.joinGame("D");
    assertEquals(gameId, gameId2);
    assertEquals(gameId3, gameId2);
    assertEquals(gameId3, gameId4);
    assertEquals(playerId, "p1");
    assertEquals(playerId2, "p2");
    assertEquals(playerId3, "p3");
    assertEquals(playerId4, "p4");
    assert(sessions.getGameStatus(gameId).isGameReady);
    assert(sessions.getGameStatus(gameId2).isGameReady);
    assert(sessions.getGameStatus(gameId3).isGameReady);
    assert(sessions.getGameStatus(gameId4).isGameReady);

    const { gameId: game2Id, playerId: playerId5 } = sessions.joinGame("E");
    assertEquals(game2Id, "1001");
    assertEquals(playerId5, "p1");
    assertEquals(sessions.games.size, 1);
  });

  it("should give the correct dice roll in sequence", () => {
    const sessions = new SessionStore();
    const diceFn = sessions.diceCycle();
    const firstDie = diceFn();
    const secondDie = diceFn();
    const thirdDie = diceFn();
    assertEquals(3, firstDie);
    assertEquals(2, secondDie);
    assertEquals(4, thirdDie);
  });
});
