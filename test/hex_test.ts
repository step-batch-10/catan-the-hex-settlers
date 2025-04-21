import { assertEquals } from 'assert';
import { describe, it } from 'testing/bdd';
import { Hex } from '../src/models/hex.ts';

describe('Hex', () => {
  const hex = new Hex('h1', 0, 0, 'forest', 8, false, 'wood');

  it('should initialize correctly', () => {
    assertEquals(hex.id, 'h1');
    assertEquals(hex.q, 0);
    assertEquals(hex.r, 0);
    assertEquals(hex.terrain, 'forest');
    assertEquals(hex.terrainNumber, 8);
    assertEquals(hex.hasRobber, false);
    assertEquals(hex.resource, 'wood');
  });

  it('should place and remove robber', () => {
    hex.placeRobber();
    assertEquals(hex.hasRobber, true);
    hex.removeRobber();
    assertEquals(hex.hasRobber, false);
  });

  it('should convert to string', () => {
    assertEquals(hex.toString(), 'forest');
  });

  it('should convert to JSON', () => {
    const json = hex.toJSON();
    assertEquals(json, {
      id: 'h1',
      q: 0,
      r: 0,
      terrain: 'forest',
      terrainNumber: 8,
      hasRobber: false,
    });
  });
});
