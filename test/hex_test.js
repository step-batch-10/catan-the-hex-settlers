import { assertEquals } from 'assert';
import { describe, it } from 'testing/bdd';
import { Hex } from '../src/models/hex.js';

describe('Hex', () => {
  it('should place the robber', () => {
    const hex = new Hex('hex2', 1, 2, 'hill', 5, false);
    hex.placeRobber();
    assertEquals(hex.hasRobber, true);
  });

  it('should remove the robber', () => {
    const hex = new Hex('hex3', 2, 3, 'desert', null, true);
    hex.removeRobber();
    assertEquals(hex.hasRobber, false);
  });

  it('should return terrain as string', () => {
    const hex = new Hex('hex4', 3, 4, 'mountain', 6, false);
    assertEquals(hex.toString(), 'mountain');
  });

  it('should correctly initialize all properties', () => {
    const hex = new Hex('hex1', 0, 1, 'forest', 8, false);

    assertEquals(hex.id, 'hex1');
    assertEquals(hex.q, 0);
    assertEquals(hex.r, 1);
    assertEquals(hex.terrain, 'forest');
    assertEquals(hex.terrainNumber, 8);
    assertEquals(hex.hasRobber, false);
  });
});
