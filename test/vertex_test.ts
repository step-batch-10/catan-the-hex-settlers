import { assertEquals } from 'assert';
import { describe, it } from 'testing/bdd';
import { Vertex } from '../src/models/vertex.ts';

describe('Vertex', () => {
  const vertex = new Vertex('v1', 'port');

  it('should initialize correctly', () => {
    assertEquals(vertex.id, 'v1');
    assertEquals(vertex.harbor, 'port');
    assertEquals(vertex.owner, null);
    assertEquals(vertex.color, null);
    assertEquals(vertex.adjacentHexes.length, 0);
  });

  it('should occupy vertex', () => {
    vertex.occupy('p1', 'red');
    assertEquals(vertex.owner, 'p1');
    assertEquals(vertex.color, 'red');
  });

  it('should check if occupied', () => {
    assertEquals(vertex.isOccupied(), true);
  });

  it('should get occupied by', () => {
    assertEquals(vertex.occupiedBy(), 'p1');
  });

  it('should get vertex key', () => {
    const vertexKey = Vertex.getVertexKey(0, 0, 1);
    assertEquals(vertexKey, 'v0,0|1,-1|1,0');
  });

  it('should return JSON data', () => {
    const json = vertex.toJSON();
    assertEquals(json, {
      id: 'v1',
      owner: 'p1',
      harbor: 'port',
      adjacentHexes: [],
    });
  });
});
