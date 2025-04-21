import { Hono } from 'hono';
import { createApp } from '../src/app.js';
import { describe, it, beforeEach } from 'testing/bdd';
import { assertEquals, assert, assertNotEquals } from 'assert';
import { Catan } from '../src/models/catan.ts';

describe('Catan App Routes', () => {
  let game = Catan;
  let app = Hono;

  beforeEach(() => {
    game = new Catan();
    app = createApp(game.mockGame());
  });

  it("should respond with 'ok' on /ok route", async () => {
    const res = await app.request('/ok');
    assertEquals(res.status, 200);
    const text = await res.text();
    assertEquals(text, 'ok');
  });

  it('should request dice roll on /roll-dice', async () => {
    const res = await app.request('/game/roll-dice', {
      method: 'POST',
    });
    const body = await res.json();
    assert(body.rolled.length === 2, 'Dice should return two values.');
    assert(
      body.rolled[0] >= 1 && body.rolled[0] <= 6,
      'Dice values should be between 1 and 6.'
    );
  });

  it('should allow building a settlement at a vertex on /build/vertex', async () => {
    const vertexId = 'v1_1';
    const res = await app.request('/game/build/vertex', {
      method: 'POST',
      body: JSON.stringify({ id: vertexId }),
    });
    const body = await res.json();
    assertEquals(
      body,
      true,
      'Response should be true when building a settlement.'
    );
  });

  it('should allow building a road at an edge on /build/edge', async () => {
    const edgeId = 'e1_1';
    const res = await app.request('/game/build/edge', {
      method: 'POST',
      body: JSON.stringify({ id: edgeId }),
    });
    const body = await res.json();
    assertEquals(body, true, 'Response should be true when building a road.');
  });

  it('should check if a player can build a road on /build/edge', async () => {
    const fd = new FormData();
    fd.set('id', 'e1');
    const res = await app.request('/game/can-build/edge', {
      method: 'POST',
      body: fd,
    });
    const body = await res.json();
    assertEquals(
      body.canBuild,
      false,
      "Player shouldn't be able to build a road."
    );
  });

  it('should check if a player can build a settlement on /build/vertex', async () => {
    const fd = new FormData();
    fd.set('id', 'v1');
    const res = await app.request('/game/can-build/vertex', {
      method: 'POST',
      body: fd,
    });
    const body = await res.json();
    assertEquals(
      body.canBuild,
      false,
      "Player shouldn't be able to build a settlement."
    );
  });

  it('should check if a player can roll the dice on /dice/can-roll', async () => {
    const res = await app.request('/game/dice/can-roll');
    const body = await res.json();
    assertEquals(body.canRoll, false);
  });

  it('should redirect to the game page for a player', async () => {
    const playerId = 'p1';
    const res = await app.request(`/game/${playerId}`);
    assertEquals(res.status, 303);
    assertNotEquals(
      res.headers.get('Location'),
      null,
      'Response should redirect.'
    );
  });

  it('should set a player ID cookie when redirecting', async () => {
    const playerId = 'p1';
    const res = await app.request(`/game/${playerId}`);
    const cookies = res.headers.get('Set-Cookie');
    assert(
      cookies?.includes('player-id=p1'),
      "Cookie 'player-id' should be set."
    );
  });

  it('should give gameState', async () => {
    const app = createApp(game.mockGame());
    const request = new Request('http:localhost:3000/game/gameState', {
      headers: { Cookie: 'player-id=p1' },
    });
    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.gameId, 'game123');
  });

  it('should give gameData', async () => {
    const app = createApp(game.mockGame());
    const res = await app.request('/game/gameData');
    const gameState = await res.json();

    assertEquals(gameState.vertices.length, 0);
  });
});
