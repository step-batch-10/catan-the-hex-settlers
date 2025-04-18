import { assertEquals } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';
import { Catan } from '../src/models/catan.ts';

describe('app test', () => {
  it('should give status code 200', async () => {
    const app = createApp();
    const response = await app.request('/ok');
    assertEquals(response.status, 200);
  });

  it('should give game state', async () => {
    const game = new Catan().mockGame();
    const app = createApp(game);
    const req = new Request('http:localhost:3000/game/gameState', {
      method: 'GET',
      headers: {
        Cookie: 'player-id=p1;'
      }
    });
    const response = await app.request(req);
    assertEquals(await response.json(), game.getGameState('p1'));
  });

  it('should redirect to game page', async () => {
    const app = createApp({});

    const response = await app.request('/game/p1');
    assertEquals(response.status, 303);
  });
});
