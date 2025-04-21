import { assertEquals, assert } from 'assert';
import { Board } from '../src/models/board.ts';
import { describe, it } from 'testing/bdd';

describe('Board', () => {
  const board = new Board();

  it('should initialize correctly', () => {
    assertEquals(board.hexes.size, 0);
    assertEquals(board.vertices.size, 0);
    assertEquals(board.edges.size, 0);
    assertEquals(board.settlements.size, 0);
    assertEquals(board.roads.size, 0);
  });

  it('should create board and populate hexes, vertices, and edges', () => {
    board.createBoard();

    assert(board.hexes.size > 0, 'Hexes should be created.');
    assert(board.vertices.size > 0, 'Vertices should be created.');
    assert(board.edges.size > 0, 'Edges should be created.');
  });

  it('should get all vertices data', () => {
    const verticesData = board.getVertices();
    assert(verticesData.length > 0, 'Should return vertices data.');
  });

  it('should get all edges data', () => {
    const edgesData = board.getEdges();
    assert(edgesData.length > 0, 'Should return edges data.');
  });

  it('should get all hexes data', () => {
    const hexesData = board.getHexes();
    assert(hexesData.length > 0, 'Should return hexes data.');
  });

  it('should return full board data', () => {
    const boardData = board.getBoard();
    assert(boardData.hexes.length > 0, 'Hexes data should be returned.');
    assert(boardData.vertices.length > 0, 'Vertices data should be returned.');
    assert(boardData.edges.length > 0, 'Edges data should be returned.');
  });
});
