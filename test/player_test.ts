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

  it('should add special card correctly', () => {
    player.addSpecialCard('largestArmy');
    assertEquals(player.hasLargestArmy, true);

    player.addSpecialCard('longestRoad');
    assertEquals(player.hasLongestRoad, true);
    assertEquals(player.victoryPoints, 12);
  });

  it('should deduct special card correctly', () => {
    player.deductSpecialCard('largestArmy');
    assertEquals(player.hasLargestArmy, false);

    player.deductSpecialCard('longestRoad');
    assertEquals(player.hasLongestRoad, false);
    assertEquals(player.victoryPoints, 8);
  });

  it('should play development card', () => {
    player.devCards.owned.knight = 2;
    player.devCards.played.knight = 1;

    player.playDevCard('knight');
    assertEquals(player.devCards.owned.knight, 1);
    assertEquals(player.devCards.played.knight, 2);
  });

  it('should add a road', () => {
    player.addRoad('edge1');
    assertEquals(player.roads.includes('edge1'), true);
  });

  it('should add a settlement', () => {
    player.addSettlement('v1');
    assertEquals(player.settlements.includes('v1'), true);
  });

  it('should add a city and remove settlement', () => {
    player.addSettlement('v2');
    player.addCity('v2');
    assertEquals(player.cities.includes('v2'), true);
    assertEquals(player.settlements.includes('v2'), false);
  });

  it('should update longest road count', () => {
    player.updateLongestRoad(5);
    assertEquals(player.longestRoadCount, 5);
  });

  it('should drop cards', () => {
    player.resources.grain = 3;
    player.dropCards({ grain: 2, lumber: 0, brick: 0, wool: 0, ore: 0 });
    assertEquals(player.resources.grain, 1);
  });
});
