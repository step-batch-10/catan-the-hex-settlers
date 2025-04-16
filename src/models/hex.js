export class Hex {
  constructor(id, q, r, terrain, number, hasRobber) {
    this.id = id;
    this.q = q;
    this.r = r;
    this.terrain = terrain;
    this.terrainNumber = number;
    this.hasRobber = hasRobber;
  }

  placeRobber() {
    this.hasRobber = true;
  }

  removeRobber() {
    this.hasRobber = false;
  }

  toString() {
    return this.terrain;
  }
}
