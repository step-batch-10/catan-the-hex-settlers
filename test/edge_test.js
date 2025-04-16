import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Vertex } from "../src/models/vertex.js";
import { Edge } from "../src/models/edge.js";

describe("Edge", () => {
  it("should give if the Edge is occuped or not", () => {
    const v1 = new Vertex("v1");
    const v2 = new Vertex("v2");
    const edge = new Edge("e1", [v1, v2]);
    assertFalse(edge.isOccupied());
  });

  it("should give occupy the edge with playerId", () => {
    const v1 = new Vertex("v1");
    const v2 = new Vertex("v2");
    const edge = new Edge("e2", [v1, v2]);

    assertEquals(edge.occupy("p1"), "e2");
    assert(edge.isOccupied());
    assertEquals(edge.occupiedBy(), "p1");
  });
});
