import { assertEquals } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';

describe('app test', () => {
  it('should give status code 200', async () => {
    const app = createApp();
    const response = await app.request('/ok');
    assertEquals(response.status, 200);
  });

  it('should give empty list of players', async () => {
    const gameData = { players: [] };
    const app = createApp(gameData);
    const response = await app.request('/players');
    assertEquals(await response.json(), []);
  });

  it('should give list of 2 players', async () => {
    const gameData = {
      players: [
        {
          id: 'p1',
          name: 'vineet',
          color: 'blue',
          victoryPoints: 5,
          resources: { wood: 1, brick: 2, sheep: 0, wheat: 1, ore: 0 },
          roads: ['e12', 'e13'],
          settlements: ['v5', 'v19'],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false
        },
        {
          id: 'p1',
          name: 'pavani',
          color: 'green',
          victoryPoints: 5,
          resources: { wood: 1, brick: 2, sheep: 0, wheat: 1, ore: 0 },
          roads: ['e12', 'e13'],
          settlements: ['v5', 'v19'],
          cities: [],
          devCards: 2,
          hasLongestRoad: false,
          hasLargestArmy: false
        }
      ]
    };
    const app = createApp(gameData);
    const response = await app.request('/players');
    assertEquals(await response.json(), gameData.players);
  });
});

describe('dice testing', () => {
  it('should give {dice1 :4,dice2 :5} ', async () => {
    const gameData = { diceRoll: [4, 5] };
    const app = createApp(gameData);
    const response = await app.request('/dice');
    assertEquals(await response.json(), { dice1: 4, dice2: 5 });
  });

  it('should give status code 200 ', async () => {
    const gameData = { diceRoll: [1, 2] };
    const app = createApp(gameData);
    const response = await app.request('/dice');
    assertEquals(response.status, 200);
  });

  it('should give {isRolled : false}', async () => {
    const gameData = {
      playerId: 'p1',
      diceRoll: [1, 2],
      availableActions: {
        canRoll: true
      }
    };
    const app = createApp(gameData);
    const playerId = 'p1';
    const response = await app.request(`/canRoll/${playerId}`);
    assertEquals(await response.json(), { isRolled: false });
  });

  it('should give {isRolled : false} ', async () => {
    const gameData = {
      playerId: 'p1',
      diceRoll: [1, 2],
      availableActions: {
        canRoll: false
      }
    };
    const app = createApp(gameData);
    const playerId = 'p1';
    const response = await app.request(`/canRoll/${playerId}`);
    assertEquals(await response.json(), { isRolled: true });
  });

  it('should give {isRolled : true} ', async () => {
    const gameData = {
      playerId: 'p1',
      diceRoll: [1, 2],
      availableActions: {
        canRoll: false
      }
    };
    const app = createApp(gameData);
    const playerId = 'p2';
    const response = await app.request(`/canRoll/${playerId}`);
    assertEquals(await response.json(), { isRolled: true });
  });
});
