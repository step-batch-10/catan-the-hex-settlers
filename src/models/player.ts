export interface Resources {
  wood: number;
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
  [key: string]: number;
}

interface DevCards {
  knight: number;
  "road-building": number;
  "year-of-plenty": number;
  monopoly: number;
}

export class Player {
  id: string;
  name: string;
  color: string;
  resources: Resources;
  roads: string[];
  settlements: string[];
  cities: string[];
  devCards: DevCards;
  hasLongestRoad: boolean;
  hasLargestArmy: boolean;
  victoryPoints: number;

  constructor(id: string, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.color = color;

    this.resources = {
      wood: 0,
      brick: 0,
      sheep: 0,
      wheat: 0,
      ore: 0,
    };

    this.roads = [];
    this.settlements = [];
    this.cities = [];

    this.devCards = {
      knight: 0,
      "road-building": 0,
      "year-of-plenty": 0,
      monopoly: 0,
    };

    this.hasLongestRoad = false;
    this.hasLargestArmy = false;
    this.victoryPoints = 0;
  }

  hasWon(): boolean {
    return this.victoryPoints >= 10;
  }

  addResource(cardType: keyof Resources | string, count: number): void {
    if (!(cardType in this.resources)) return;
    this.resources[cardType] += count;
  }

  getPlayerData(): {
    id: string;
    name: string;
    color: string;
    resources: Resources;
    roads: string[];
    settlements: string[];
    cities: string[];
    devCards: DevCards;
    hasLargestArmy: boolean;
    hasLongestRoad: boolean;
    victoryPoints: number;
  } {
    const {
      id,
      name,
      color,
      resources,
      roads,
      settlements,
      cities,
      devCards,
      hasLargestArmy,
      hasLongestRoad,
      victoryPoints,
    } = this;

    if (id === "p1") this.hasLargestArmy = !this.hasLargestArmy;
    if (id === "p3") this.hasLongestRoad = !this.hasLongestRoad;

    return {
      id,
      name,
      color,
      resources,
      roads,
      settlements,
      cities,
      devCards,
      hasLargestArmy,
      hasLongestRoad,
      victoryPoints,
    };
  }
}
