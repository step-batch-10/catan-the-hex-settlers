export class Edge {
  constructor(id, vertices) {
    this.id = id;
    this.vertices = vertices;
    this.owner = null;
  }

  isOccupied() {
    return this.owner !== null;
  }

  occupy(ownerId) {
    this.owner = ownerId;
    return this.id;
  }

  occupiedBy() {
    return this.owner;
  }
}
