import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Vertex } from "../src/models/vertex.ts";
import { Edge } from "../src/models/edge.ts";

describe("Edge", () => {
  it("should give if the Edge is occupied or not", () => {
    const v1 = new Vertex("v1", null);
    const v2 = new Vertex("v2", null);
    const edge = new Edge("e1", [v1.id, v2.id]);

    assertFalse(edge.isOccupied());
  });

  it("should occupy the edge with playerId", () => {
    const v1 = new Vertex("v1", null);
    const v2 = new Vertex("v2", null);
    const edge = new Edge("e2", [v1.id, v2.id]);

    assertEquals(edge.occupy("p1"), "e2");
    assert(edge.isOccupied());
    assertEquals(edge.occupiedBy(), "p1");
  });
});
