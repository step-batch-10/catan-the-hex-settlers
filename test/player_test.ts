import { assertEquals } from 'assert';
import { describe, it } from 'testing/bdd';
import { Player } from '../src/models/player.ts';

describe('Player', () => {
  const player = new Player('p1', 'Alice', 'red');

  it('should initialize correctly', () => {
    assertEquals(player.id, 'p1');
    assertEquals(player.name, 'Alice');
    assertEquals(player.color, 'red');
    assertEquals(player.victoryPoints, 0);
    assertEquals(player.hasLargestArmy, false);
    assertEquals(player.hasLongestRoad, false);
    assertEquals(player.roads.length, 0);
    assertEquals(player.settlements.length, 0);
    assertEquals(player.cities.length, 0);
    assertEquals(player.resources.lumber, 0);
    assertEquals(player.devCards.owned.knight, 0);
  });

  it('should return win status', () => {
    player.victoryPoints = 10;
    assertEquals(player.hasWon(), true);
  });

  it('should return win status with LargestArmy', () => {
    player.victoryPoints = 8;
    player.hasLargestArmy = true;
    assertEquals(player.hasWon(), true);
  });

  it('should return win status with longestRoad', () => {
    player.victoryPoints = 8;
    player.hasLongestRoad = true;
    assertEquals(player.hasWon(), true);
  });

  it('should add resource', () => {
    player.addResource('lumber', 2);
    assertEquals(player.resources.lumber, 2);

    player.addResource('brick', 1);
    assertEquals(player.resources.brick, 1);
  });

  it('should not add invalid resource', () => {
    player.addResource('unknown', 5);
    assertEquals(player.resources.unknown, undefined);
  });

  it('should return player data', () => {
    const data = player.getPlayerData();
    assertEquals(data.name, 'Alice');
    assertEquals(data.color, 'red');
    assertEquals(data.roads.length, 0);
    assertEquals(data.devCards.owned.knight, 0);
  });
});
