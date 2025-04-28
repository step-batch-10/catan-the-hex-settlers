import { Hono } from 'hono';
import { createApp } from '../src/app.ts';
import { describe, it, beforeEach } from 'testing/bdd';
import { assertEquals, assert, assertNotEquals, assertFalse } from 'assert';
import { Catan } from '../src/models/catan.ts';
import { Board } from '../src/models/board.ts';
import { Player } from '../src/models/player.ts';
import _ from 'lodash';
import { DevelopmentCards } from '../src/types.ts';

describe('Catan App Routes', () => {
  let catan: Catan;
  let app: Hono;
  beforeEach(() => {
    const players = [];
    players.push(new Player('p1', 'Adil', 'red'));
    players.push(new Player('p2', 'Aman', 'blue'));
    players.push(new Player('p3', 'Vineet', 'orange'));
    players.push(new Player('p4', 'Shalu', 'white'));
    const board = new Board();
    board.createBoard();
    const resources = {
      ore: 25,
      brick: 25,
      lumber: 25,
      wool: 25,
      grain: 25,
    };
    const devCards: DevelopmentCards[] = [
      'knight',
      'knight',
      'monopoly',
      'knight',
    ];
    const supply = { resources, devCards };
    catan = new Catan('game123', players, board, _.random, supply);
    app = createApp(catan);
  });

  it('should request dice roll on /roll-dice', async () => {
    catan.diceFn = () => 5;
    const res = await app.request('/game/dice/roll', { method: 'POST' });
    const body = await res.json();

    assert(body.rolled.length === 2, 'Dice should return two values.');
    assertEquals(body, { rolled: [5, 5], isRobber: false });
  });

  it('should allow building a settlement at a vertex on /build/vertex', async () => {
    const vertexId = 'v1_1';
    const res = await app.request('/game/build/vertex', {
      method: 'POST',
      body: JSON.stringify({ id: vertexId }),
    });
    const body = await res.json();
    assert(body, 'Response should be true when building a settlement.');
  });

  it('should allow building a road at an edge on /build/edge', async () => {
    const edgeId = 'e1_1';
    const res = await app.request('/game/build/edge', {
      method: 'POST',
      body: JSON.stringify({ id: edgeId }),
    });
    const body = await res.json();
    assert(body, 'Response should be true when building a road.');
  });

  it('should check if a player can build a road on /build/edge', async () => {
    const fd = new FormData();
    fd.set('id', 'e1');
    const res = await app.request('/game/can-build/edge', {
      method: 'POST',
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
      body: fd,
    });
    const body = await res.json();
    assertFalse(body.canBuild, "Player shouldn't be able to build settlement.");
  });

  it('should check if a player can roll the dice on /dice/can-roll', async () => {
    const res = await app.request('/game/dice/can-roll');
    const body = await res.json();
    assertFalse(body.canRoll);
  });

  it('should redirect to the game page for a player', async () => {
    const playerId = 'p1';
    const res = await app.request(`/game/${playerId}`);
    assertEquals(res.status, 303);
    assertNotEquals(
      res.headers.get('Location'),
      null,
      'Response should redirect.',
    );
  });

  it('should set a player ID cookie when redirecting', async () => {
    const playerId = 'p1';
    const res = await app.request(`/game/${playerId}`);
    const cookies = res.headers.get('Set-Cookie');
    assert(
      cookies?.includes('player-id=p1'),
      "Cookie 'player-id' should be set.",
    );
  });

  it('should give gameState', async () => {
    const request = new Request('http:localhost/game/gameState', {
      headers: { Cookie: 'player-id=p1' },
    });
    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.gameId, 'game123');
  });

  it('should give gameData', async () => {
    const request = new Request('http:localhost/game/gameData', {
      headers: { Cookie: 'player-id=p1' },
    });
    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.vertices.length, 0);
  });

  it('should give redirect to results if player has won', async () => {
    const request = new Request('http:localhost/game/gameData', {
      headers: { Cookie: 'player-id=p1' },
    });

    catan.players[0].victoryPoints = 20;
    const res = await app.request(request);

    assertEquals(res.headers.get('location'), '/results');
    assertEquals(res.status, 303);
  });

  it('should Update the players resources', async () => {
    const player = _.find(catan.players, { id: 'p1' });

    player.resources.lumber = 3;

    const tradeResource = {
      outgoingResources: {
        lumber: 2,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0,
      },

      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 1,
        ore: 0,
      },
    };

    await app.request('http://localhost/game/trade/maritime', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1', 'content-type': 'application/json' },
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
      headers: { Cookie: 'player-id=p1' },
      method: 'POST',
    });
    const res = await app.request(request);
    const gameState = await res.json();

    assertEquals(gameState.currentPlayerIndex, 1);
  });

  it('should give all the possible locations to place', async () => {
    const request = new Request('http:localhost/game/possible-positions', {
      headers: { Cookie: 'player-id=p1' },
    });

    const res = await app.request(request);
    const allPositions = await res.json();

    assertEquals(allPositions.settlements.length, 54);
    assertEquals(allPositions.roads.length, 0);
  });

  it('should give all the possible locations to place', async () => {
    const request = new Request('http:localhost/game/possible-positions', {
      headers: { Cookie: 'player-id=p1' },
    });
    catan.buildSettlement('v0,1|0,2|1,1');
    const res = await app.request(request);
    const allPositions = await res.json();

    assertEquals(allPositions.settlements.length, 0);
    assertEquals(allPositions.roads.length, 3);
  });

  it('should buy development card', async () => {
    const request = new Request('http://localhost:3000/game/buy/dev-card', {
      headers: { Cookie: 'player-id=p1' },
      method: 'PATCH',
    });
    const res = await app.request(request);
    const result = await res.json();
    assertFalse(result.isSucceed);
  });

  it('should return true if valid hex id', async () => {
    const fd = new FormData();
    fd.set('id', 'h0_1');

    const request = new Request('http://localhost:3000/game/can-place-robber', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1' },
      body: fd,
    });
    const res = await app.request(request);
    const { isValid } = await res.json();
    assert(isValid);
  });

  it('should return false if desert', async () => {
    const fd = new FormData();
    fd.set('id', 'h0_2');

    const request = new Request('http://localhost:3000/game/can-place-robber', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1' },
      body: fd,
    });

    const res = await app.request(request);
    const { isValid } = await res.json();
    assertFalse(isValid);
  });

  it('should return false if desert', async () => {
    const fd = new FormData();
    fd.set('id', 'h0_1');

    const request = new Request('http://localhost:3000/game/moveRobber', {
      method: 'POST',
      headers: { Cookie: 'player-id=p1' },
      body: fd,
    });

    const res = await app.request(request);
    const result = await res.text();
    assertEquals(result, 'ok');
    assertEquals(catan.board.robberPosition, 'h0_1');
  });
});
