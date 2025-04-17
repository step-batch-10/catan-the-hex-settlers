import { Edge } from './edge.ts';

export class Vertex {
  static readonly CORNER_OFFSETS: [number, number][] = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1]
  ];
  id: string;
  harbor: string | null;
  owner: string | null;
  adjacentHexes: string[];
  connectedVertices: Vertex[];
  connectedEdges: Edge[];

  constructor(id: string, harbor: string | null) {
    this.id = id;
    this.harbor = harbor;
    this.owner = null;
    this.adjacentHexes = [];
    this.connectedVertices = [];
    this.connectedEdges = [];
  }

  static getVertexKey(q: number, r: number, cornerIndex: number): string {
    const directions: [number, number][] = [
      [0, 0],
      this.CORNER_OFFSETS[cornerIndex],
      this.CORNER_OFFSETS[(cornerIndex + 5) % 6]
    ];

    const hexesTouchingVertex = directions.map(([dq, dr]) => [q + dq, r + dr]);

    const keyParts = hexesTouchingVertex.map(([q, r]) => `${q},${r}`);

    keyParts.sort();

    return keyParts.join('|');
  }

  isOccupied(): boolean {
    return this.owner !== null;
  }

  occupy(ownerId: string): boolean {
    this.owner = ownerId;
    return true;
  }

  occupiedBy(): string | null {
    return this.owner;
  }
}
