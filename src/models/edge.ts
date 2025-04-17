interface EdgeData {
  id: string;
  owner: string | null;
}

export class Edge {
  id: string;
  vertices: [string, string];
  owner: string | null;

  constructor(id: string, vertices: [string, string]) {
    this.id = id;
    this.vertices = vertices;
    this.owner = null;
  }

  static getEdgeKey(v1: string, v2: string): string {
    return [v1, v2].sort().join('_');
  }

  isOccupied(): boolean {
    return this.owner !== null;
  }

  occupy(ownerId: string): string {
    this.owner = ownerId;
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
