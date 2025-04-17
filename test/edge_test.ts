import { assert, assertEquals, assertFalse } from 'assert';
import { describe, it } from 'testing/bdd';
import { Vertex } from '../src/models/vertex.ts';
import { Edge } from '../src/models/edge.ts';

describe('Edge', () => {
  it('should give if the Edge is occupied or not', () => {
    const v1 = new Vertex('v1', null);
    const v2 = new Vertex('v2', null);
    const edge = new Edge('e1', [v1.id, v2.id]);

    assertFalse(edge.isOccupied());
  });

  it('should occupy the edge with playerId', () => {
    const v1 = new Vertex('v1', null);
    const v2 = new Vertex('v2', null);
    const edge = new Edge('e2', [v1.id, v2.id]);

    assertEquals(edge.occupy('p1'), 'e2');
    assert(edge.isOccupied());
    assertEquals(edge.occupiedBy(), 'p1');
  });

  it('should return edge key for consistent identification', () => {
  const key1 = Edge.getEdgeKey('v1', 'v2');

    assertEquals(key1, 'e-v1_v2');
  });

  it('should return sorted edge key for consistent identification', () => {
    const key1 = Edge.getEdgeKey('v1', 'v2');
    const key2 = Edge.getEdgeKey('v2', 'v1');

    assertEquals(key1, 'e-v1_v2');
    assertEquals(key2, 'e-v1_v2');
  });

  it("should serialize to JSON correctly", () => {
    const edge = new Edge("e4", ["v7", "v8"]);
    edge.occupy("player2");

    const json = edge.toJSON();

    assertEquals(json, {
      id: "e4",
      owner: "player2"
    });
  });
});
