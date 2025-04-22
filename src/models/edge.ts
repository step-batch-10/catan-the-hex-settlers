import type { EdgeData } from '../types.ts';

export class Edge {
  id: string;
  vertices: [string, string];
  owner: string | null;
  color: string | null;

  constructor(id: string, vertices: [string, string]) {
    this.id = id;
    this.vertices = vertices;
    this.owner = null;
    this.color = null;
  }

  static getEdgeKey(v1: string, v2: string): string {
    return 'e-' + [v1, v2].sort().join('_');
  }

  isOccupied(): boolean {
    return this.owner !== null;
  }

  occupy(ownerId: string, color: string): string {
    this.owner = ownerId;
    this.color = color;

    return this.id;
  }

  occupiedBy(): string | null {
    return this.owner;
  }

  toJSON(): EdgeData {
    const { id, owner } = this;
    return { id, owner };
  }
}
