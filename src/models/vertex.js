const CORNER_OFFSETS = [
  [1, 0], 
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1]
];

export class Vertex {
  constructor(id, harbor) {
    this.id = id;
    this.harbor = harbor;
    this.owner = null;
    this.adjacentHexes = [];
    this.connectedVertices = [];
    this.connectedEdges = [];
  }

  static getVertexKey(q, r, cornerIndex) {
    const directions = [
      [0, 0],
      CORNER_OFFSETS[cornerIndex],
      CORNER_OFFSETS[(cornerIndex + 5) % 6],
    ];

    const hexesTouchingVertex = directions.map(([dq, dr]) => [q + dq, r + dr]);
    const keyParts = hexesTouchingVertex.map(([q, r]) => `${q},${r}`);
    keyParts.sort();

    return keyParts.join('|');
  }

  isOccupied() {
    return this.owner !== null;
  }

  occupy(ownerId) {
    this.owner = ownerId;
    return true;
  }

  occupiedBy() {
    return this.owner;
  }
}
