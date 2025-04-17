import { assertEquals, assertFalse } from 'assert';
import { describe, it } from 'testing/bdd';
import { Player } from '../src/models/player.ts';

describe('Player', () => {
  it('should initialize all properties correctly', () => {
    const player = new Player('p1', 'Ajay', 'red');

    assertEquals(player.id, 'p1');
    assertEquals(player.name, 'Ajay');
    assertEquals(player.color, 'red');

    assertEquals(player.resources, {
      wood: 0,
      brick: 0,
      sheep: 0,
      wheat: 0,
      ore: 0
    });

    assertEquals(player.devCards, {
      knight: 0,
      'road-building': 0,
      'year-of-plenty': 0,
      monopoly: 0
    });

    assertEquals(player.roads.length, 0);
    assertEquals(player.settlements.length, 0);
    assertEquals(player.cities.length, 0);

    assertFalse(player.hasLongestRoad);
    assertFalse(player.hasLargestArmy);
    assertEquals(player.victoryPoints, 0);
  });

  it('should return false for hasWon() if under 10 points', () => {
    const player = new Player('p2', 'Surendra', 'blue');
    player.victoryPoints = 7;
    assertFalse(player.hasWon());
  });

  it('should return true for hasWon() if 10 or more points', () => {
    const player = new Player('p3', 'Adil', 'white');
    player.victoryPoints = 10;
    assertEquals(player.hasWon(), true);
  });

  it('should return correct player data with getPlayerData()', () => {
    const player = new Player('p4', 'Aman', 'orange');
    player.resources.wood = 1;
    player.settlements.push('s1');
    player.devCards.knight = 2;
    player.hasLargestArmy = true;
    player.victoryPoints = 5;

    const data = player.getPlayerData();

    assertEquals(data, {
      id: 'p4',
      name: 'Aman',
      color: 'orange',
      resources: {
        wood: 1,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0
      },
      roads: [],
      settlements: ['s1'],
      cities: [],
      devCards: {
        knight: 2,
        'road-building': 0,
        'year-of-plenty': 0,
        monopoly: 0
      },
      hasLargestArmy: true,
      hasLongestRoad: false,
      victoryPoints: 5
    });
  });
});
