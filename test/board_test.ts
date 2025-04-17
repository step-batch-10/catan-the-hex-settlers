import { assert, assertEquals } from 'assert';
import { describe, it, beforeEach } from 'testing/bdd';
import { Board } from '../src/models/board.ts';

let board: Board;

beforeEach(() => {
  board = new Board();
  board.createBoard();
});

describe('Board', () => {
  it('should create vertices from hexes', () => {
    const vertices = board.getVertices();
    assert(vertices.length > 6);
  });

  it('should create edges between vertices', () => {
    const edges = board.getEdges();
    assert(edges.length >= 6);
  });

  it('should serialize the board correctly', () => {
    const result = board.getBoard();
    assertEquals(Object.keys(result), ['board']);
    assertEquals(result.board.hexes.length, 19);
  });

  it('should link vertices to each other and to edges', () => {
    const vertices = [...board.vertices.values()];
    for (const vertex of vertices) {
      assert(vertex.connectedVertices.size > 0);
      assert(vertex.connectedEdges.size > 0);
    }
  });
});
