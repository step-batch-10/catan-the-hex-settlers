export class Edge {
  id: string;
  vertices: [string, string]; 
  owner: string | null;

  constructor(id: string, vertices: [string, string]) {
    this.id = id;
    this.vertices = vertices;
    this.owner = null;
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
}
