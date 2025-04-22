import { Resources } from '../types.ts';

export class Hex {
  id: string;
  q: number;
  r: number;
  terrain: string;
  terrainNumber: number | null;
  hasRobber: boolean;
  resource: keyof Resources | string;

  constructor(
    id: string,
    q: number,
    r: number,
    terrain: string,
    number: number | null,
    hasRobber: boolean,
    resource: keyof Resources | string,
  ) {
    this.id = id;
    this.q = q;
    this.r = r;
    this.terrain = terrain;
    this.resource = resource;
    this.terrainNumber = number;
    this.hasRobber = hasRobber;
  }

  placeRobber(): void {
    this.hasRobber = true;
  }

  removeRobber(): void {
    this.hasRobber = false;
  }

  toString(): string {
    return this.terrain;
  }

  toJSON(): object {
    const { hasRobber, id, q, r, terrain, terrainNumber } = this;
    return { id, q, r, terrain, terrainNumber, hasRobber };
  }
}
