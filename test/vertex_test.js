import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "testing/bdd";
import { Vertex } from "../src/models/vertex.js";

describe("Vertex", () => {
  it("should give if the vertex is occuped or not", () => {
    const vertex = new Vertex("1,1|1,-2|0,1");
    assertFalse(vertex.isOccupied());
  });

  it("should give ocuupy the vertex with playerId", () => {
    const vertex = new Vertex("1,1|1,-2|0,1");

    assert(vertex.occupy("p1"));
    assert(vertex.isOccupied());
    assertEquals(vertex.occupiedBy(), "p1");
  });
});
