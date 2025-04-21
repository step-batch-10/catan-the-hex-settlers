import { assertEquals } from 'assert';
import { describe, it } from 'testing/bdd';
import { Vertex } from '../src/models/vertex.ts';
import { Edge } from '../src/models/edge.ts';

describe('Edge', () => {
  const vertex1 = new Vertex('v1', 'port');
  const vertex2 = new Vertex('v2', 'none');
  const edge = new Edge('e-v1_v2', [vertex1.id, vertex2.id]);

  it('should initialize correctly', () => {
    assertEquals(edge.id, 'e-v1_v2');
    assertEquals(edge.vertices, [vertex1.id, vertex2.id]);
    assertEquals(edge.owner, null);
    assertEquals(edge.color, null);
  });

  it('should occupy edge', () => {
    edge.occupy('p1', 'red');
    assertEquals(edge.owner, 'p1');
    assertEquals(edge.color, 'red');
  });

  it('should check if occupied', () => {
    assertEquals(edge.isOccupied(), true);
  });

  it('should get occupied by', () => {
    assertEquals(edge.occupiedBy(), 'p1');
  });

  it('should return edge key', () => {
    const edgeKey = Edge.getEdgeKey('v1', 'v2');
    assertEquals(edgeKey, 'e-v1_v2');
  });

  it('should return JSON data', () => {
    const json = edge.toJSON();
    assertEquals(json, {
      id: 'e-v1_v2',
      owner: 'p1',
    });
  });
});
