import { assert, assertEquals, assertStringIncludes } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';

const createMockGame = () => {
  return {
    getGameState: (playerId) => ({ playerId, state: 'mocked' }),
    rollDice: () => [3, 5],
    players: [{ id: 'p1' }, { id: 'p2' }],
    currentPlayerIndex: 0,
  };
};

describe('app test', () => {
  it('should give status code 200', async () => {
    const app = createApp();
    const response = await app.request('/ok');
    assertEquals(response.status, 200);
  });

  it('should give game state', async () => {
    const game = createMockGame();
    const app = createApp(game);
    const req = new Request('http://localhost/game/gameState', {
      method: 'GET',
      headers: {
        Cookie: 'player-id=p1;',
      },
    });
    const response = await app.request(req);
    assertEquals(await response.json(), { playerId: 'p1', state: 'mocked' });
  });

  it('should redirect to game page and set cookie', async () => {
    const app = createApp({});
    const response = await app.request('http://localhost/game/p1');
    assertEquals(response.status, 303);
    assertEquals(response.headers.get('location'), '/game.html');
    const cookie = response.headers.get('set-cookie');
    assert(cookie);
    assertStringIncludes(cookie, 'player-id=p1');
  });

  it('should roll dice on POST /game/roll-dice', async () => {
    const game = createMockGame();
    const app = createApp(game);
    const req = new Request('http://localhost/game/roll-dice', {
      method: 'POST',
    });
    const response = await app.request(req);
    const data = await response.json();
    assertEquals(data.rolled, [3, 5]);
  });

  it("should return canRoll: true if it is player's turn", async () => {
    const game = createMockGame();
    const app = createApp(game);
    const req = new Request('http://localhost/game/dice/can-roll', {
      headers: {
        Cookie: 'player-id=p1',
      },
    });
    const res = await app.request(req);
    const body = await res.json();
    assertEquals(body.canRoll, true);
  });

  it("should return canRoll: false if it is NOT player's turn", async () => {
    const game = createMockGame();
    game.currentPlayerIndex = 1; // it's p2's turn
    const app = createApp(game);
    const req = new Request('http://localhost/game/dice/can-roll', {
      headers: {
        Cookie: 'player-id=p1',
      },
    });
    const res = await app.request(req);
    const body = await res.json();
    assertEquals(body.canRoll, false);
  });

  it('should serve static fallback (simulate)', async () => {
    const app = createApp({});
    const response = await app.request('/nonexistent-route');
    assertEquals(response.status, 404);
  });
});
