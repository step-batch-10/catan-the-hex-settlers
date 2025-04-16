import { assert, assertEquals, assertFalse } from 'assert';
import { describe, it } from 'testing/bdd';
import { Vertex } from '../src/models/vertex.js';

describe('Vertex', () => {
  it('should give if the vertex is occuped or not', () => {
    const vertex = new Vertex('v1');
    assertFalse(vertex.isOccupied());
  });

  it('should give ocuupy the vertex with playerId', () => {
    const vertex = new Vertex('v1');

    assert(vertex.occupy('p1'));
    assert(vertex.isOccupied());
    assertEquals(vertex.occupiedBy(), 'p1');
  });

  it('should correctly initialize all properties', () => {
    const vertex = new Vertex('v1', 'wood');

    assertEquals(vertex.id, 'v1');
    assertEquals(vertex.harbor, 'wood');
    assertEquals(vertex.owner, null);
    assertEquals(vertex.adjacentHexes.length, 0);
    assertEquals(vertex.connectedVertices.length, 0);
    assertEquals(vertex.connectedEdges.length, 0);
  });
});

describe('Vertex', () => {
  it('should return correct vertex key from getVertexKey', () => {
    const key = Vertex.getVertexKey(0, 0, 5);
    const expectedHexCoords = [
      [0, 0],
      [0, 1],
      [-1, 1],
    ]
      .map(([q, r]) => `${q},${r}`)
      .sort()
      .join('|');

    assertEquals(key, expectedHexCoords);
  });

  it('should return correct vertex key for different cornerIndex', () => {
    const key = Vertex.getVertexKey(0, 0, 4);
    const expectedHexCoords = [
      [0, 0],
      [-1, 0],
      [-1, 1],
    ]
      .map(([q, r]) => `${q},${r}`)
      .sort()
      .join('|');

    assertEquals(key, expectedHexCoords);
  });

  it('should return correct vertex key for cornerIndex 0', () => {
    const key = Vertex.getVertexKey(0, 0, 0);
    const expectedHexCoords = [
      [0, 0],
      [1, 0],
      [0, 1],
    ]
      .map(([q, r]) => `${q},${r}`)
      .sort()
      .join('|');

    assertEquals(key, expectedHexCoords);
  });

  it('should return correct vertex key for cornerIndex 1', () => {
    const key = Vertex.getVertexKey(0, 0, 1);
    const expectedHexCoords = [
      [0, 0],
      [1, -1],
      [1, 0],
    ]
      .map(([q, r]) => `${q},${r}`)
      .sort()
      .join('|');

    assertEquals(key, expectedHexCoords);
  });

  it('should return correct vertex key for cornerIndex 2', () => {
    const key = Vertex.getVertexKey(0, 0, 2);
    const expectedHexCoords = [
      [0, 0],
      [0, -1],
      [1, -1],
    ]
      .map(([q, r]) => `${q},${r}`)
      .sort()
      .join('|');

    assertEquals(key, expectedHexCoords);
  });

  it('should return correct vertex key for cornerIndex 3', () => {
    const key = Vertex.getVertexKey(0, 0, 3);
    const expectedHexCoords = [
      [0, 0],
      [0, -1],
      [-1, 0],
    ]
      .map(([q, r]) => `${q},${r}`)
      .sort()
      .join('|');

    assertEquals(key, expectedHexCoords);
  });
});
