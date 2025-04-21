interface VertexData {
  id: string;
  owner: string | null;
  harbor: string | null;
  adjacentHexes: string[];
}

export class Vertex {
  static readonly CORNER_OFFSETS: [number, number][] = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ];
  id: string;
  harbor: string | null;
  owner: string | null;
  color: string | null;
  adjacentHexes: string[];
  connectedVertices: Set<string>;
  connectedEdges: Set<string>;

  constructor(id: string, harbor: string | null) {
    this.id = id;
    this.harbor = harbor;
    this.owner = null;
    this.color = null;
    this.adjacentHexes = [];
    this.connectedVertices = new Set<string>();
    this.connectedEdges = new Set<string>();
  }

  static getVertexKey(q: number, r: number, cornerIndex: number): string {
    const directions: [number, number][] = [
      [0, 0],
      this.CORNER_OFFSETS[cornerIndex],
      this.CORNER_OFFSETS[(cornerIndex + 5) % 6],
    ];

    const hexesTouchingVertex = directions.map(([dq, dr]) => [q + dq, r + dr]);

    const keyParts = hexesTouchingVertex.map(([q, r]) => `${q},${r}`);

    keyParts.sort();

    return 'v' + keyParts.join('|');
  }

  isOccupied(): boolean {
    return this.owner !== null;
  }

  occupy(ownerId: string, color: string): boolean {
    this.owner = ownerId;
    this.color = color;
    return true;
  }

  occupiedBy(): string | null {
    return this.owner;
  }

  toJSON(): VertexData {
    const { id, owner, harbor, adjacentHexes } = this;
    return { id, owner, harbor, adjacentHexes };
  }
}
