import { Hono } from 'hono';
import { createApp } from '../src/app.ts';
import { describe, it, beforeEach } from 'testing/bdd';
import { assertEquals, assert, assertFalse } from 'assert';
import { Catan } from '../src/models/catan.ts';
import _ from 'lodash';
import { SessionStore } from '../src/models/sessions.ts';

describe('Catan App Routes', () => {
  let sessions: SessionStore;
  let app: Hono;
  let catan: Catan;
  beforeEach(() => {
    sessions = new SessionStore();
    app = createApp(sessions);
    sessions.joinGame('Adil');
    sessions.joinGame('Aman');
    sessions.joinGame('Vineet');
    sessions.joinGame('Shalu');
    catan = sessions.games.get('1000') || ({} as unknown as Catan);
  });

  it('should request dice roll on /roll-dice', async () => {
    catan.diceFn = () => 5;
    const res = await app.request('/game/dice/roll', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });
    const body = await res.json();

    assert(body.rolled.length === 2, 'Dice should return two values.');
    assert(body.rolled.length === 2, 'Dice should return two values.');
    assertEquals(body, { rolled: [5, 5], isRobber: false });
  });

  it('should allow building a settlement at a vertex on /build/vertex', async () => {
    const vertexId = 'v1_1';
    const res = await app.request('/game/build/vertex', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: JSON.stringify({ id: vertexId }),
    });
    const body = await res.json();
    assert(body, 'Response should be true when building a settlement.');
    assert(body, 'Response should be true when building a settlement.');
  });

  it('should allow building a road at an edge on /build/edge', async () => {
    const edgeId = 'e1_1';
    const res = await app.request('/game/build/edge', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: JSON.stringify({ id: edgeId }),
    });
    const body = await res.json();
    assert(body, 'Response should be true when building a road.');
    assert(body, 'Response should be true when building a road.');
  });

  it('should check if a player can build a road on /build/edge', async () => {
    const fd = new FormData();
    fd.set('id', 'e1');
    const res = await app.request('/game/can-build/edge', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: fd,
    });
    const body = await res.json();
    assertFalse(body.canBuild, "Player shouldn't be able to build a road.");
  });

  it('should check if a player can build a settlement on /build/vertex', async () => {
    const fd = new FormData();
    fd.set('id', 'v1');
    const res = await app.request('/game/can-build/vertex', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: fd,
    });
    const body = await res.json();
    assertFalse(body.canBuild, "Player shouldn't be able to build settlement.");
  });

  it('should check if a player can roll the dice on /dice/can-roll', async () => {
    const res = await app.request('/game/dice/can-roll', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });
    const body = await res.json();
    assertFalse(body.canRoll);
  });

  it('should give gameData', async () => {
    const request = new Request('http:localhost/game/gameData', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });
    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.vertices.length, 0);
  });

  it('should Update the players resources', async () => {
    const player = _.find(catan.players, { id: 'p1' });

    player.resources.lumber = 3;

    const tradeResource = {
      incomingResources: {grain:1},
      outgoingResources: {lumber: 2}
    };

    await app.request('http://localhost/game/trade/bank', {
      method: 'POST',
      headers: {
        Cookie: 'player-id=p1; game-id=1000',
        'content-type': 'application/json',
      },
      body: JSON.stringify(tradeResource),
    });
    assertEquals(player.resources, {
      brick: 0,
      lumber: 1,
      wool: 0,
      grain: 1,
      ore: 0,
    });
  });

  it('should change the curent player', async () => {
    const request = new Request('http:localhost/game/changeTurn', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      method: 'POST',
    });
    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.currentPlayerIndex, 1);
  });

  it('should give all the possible locations to place', async () => {
    const request = new Request('http:localhost/game/possible-positions', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });

    const res = await app.request(request);
    const allPositions = await res.json();

    assertEquals(allPositions.settlements.length, 54);
    assertEquals(allPositions.roads.length, 0);
  });

  it('should give all the possible locations to place', async () => {
    const request = new Request('http:localhost/game/possible-positions', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });
    catan.buildSettlement('v0,1|0,2|1,1');
    catan.buildSettlement('v0,1|0,2|1,1');
    const res = await app.request(request);
    const allPositions = await res.json();

    assertEquals(allPositions.settlements.length, 50);
    assertEquals(allPositions.roads.length, 0);
  });

  it('should buy development card', async () => {
    const request = new Request('http://localhost:3000/game/buy/dev-card', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      method: 'PATCH',
    });
    const res = await app.request(request);
    const result = await res.json();
    assertFalse(result.isSucceed);
  });

  it('should return true if valid hex id', async () => {
    const fd = new FormData();
    fd.set('id', 'h0_1');
    fd.set('id', 'h0_1');

    const request = new Request('http://localhost:3000/game/can-place-robber', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: fd,
    });
    const res = await app.request(request);
    const { isValid } = await res.json();
    assert(isValid);
  });

  it('should return false if desert', async () => {
    const fd = new FormData();
    fd.set('id', 'h0_2');
    fd.set('id', 'h0_2');

    const request = new Request('http://localhost:3000/game/can-place-robber', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: fd,
    });

    const res = await app.request(request);
    const { isValid } = await res.json();
    assertFalse(isValid);
  });

  it('should return false if desert', async () => {
    const fd = new FormData();
    fd.set('id', 'h0_1');
    fd.set('id', 'h0_1');

    const request = new Request('http://localhost:3000/game/moveRobber', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      body: fd,
    });

    const res = await app.request(request);
    const result = await res.text();
    assertEquals(result, 'ok');
    assertEquals(catan.board.robberPosition, 'h0_1');
  });

  it('should create a game for a new player', async () => {
    const fd = new FormData();
    fd.set('name', 'Ajay');

    const request = new Request('http://localhost:3000/joinGame', {
      method: 'POST',
      body: fd,
    });

    const res = await app.request(request);
    assertEquals(res.headers.get('location'), '/waiting.html');
    assertEquals(res.status, 303);
  });

  it('should redirect to login page if no cookies', async () => {
    const request = new Request('http://localhost:3000/game.html');

    const res = await app.request(request);
    assertEquals(res.headers.get('location'), '/index.html');
    assertEquals(res.status, 303);
  });

  it('should serve game state of the existing game', async () => {
    const request = new Request('http://localhost:3000/game/gameState', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });

    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.gameId, '1000');
  });

  it('should return the game status as true', async () => {
    const request = new Request('http://localhost:3000/gameStatus', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });

    const res = await app.request(request);
    const { isGameReady } = await res.json();
    assert(isGameReady);
  });

  it('should return the game status as false', async () => {
    const request = new Request('http://localhost:3000/gameStatus', {
      headers: { Cookie: 'player-id=p1; game-id=1001' },
    });

    const res = await app.request(request);
    const { isGameReady } = await res.json();
    assertFalse(isGameReady);
  });

  it('should give redirect to results if player has won', async () => {
    const request = new Request('http:localhost/game/gameData', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });

    catan.players[0].victoryPoints = 20;
    const res = await app.request(request);

    assertEquals(res.headers.get('location'), '/results.html');
    assertEquals(res.status, 303);
  });

  it('should serve game results for /game/results', async () => {
    const request = new Request('http:localhost/game/results', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
    });

    const res = await app.request(request);
    const results = await res.json();

    assertEquals(results[0].name, 'Shalu');
    assertEquals(results.length, 4);
  });

  it('should redirect to login page for /game/exit', async () => {
    const request = new Request('http:localhost:/game/exit', {
      headers: { Cookie: 'player-id=p1; game-id=1000' },
      method: 'POST',
    });
    const res = await app.request(request);

    assertEquals(res.status, 303);
    assertFalse(res.headers.get('player-id'));
    assertEquals(res.headers.get('location'), '/');
  });
});
