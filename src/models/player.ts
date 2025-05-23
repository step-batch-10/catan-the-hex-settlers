import type {
  DevCards,
  DevCardTypes,
  PlayerData,
  Resources,
} from '../types.ts';

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
  largestArmyCount: number;
  longestRoadCount: number;

  constructor(id: string, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.color = color;

    this.resources = {
      lumber: 0,
      brick: 0,
      wool: 0,
      grain: 0,
      ore: 0,
    };

    this.roads = [];
    this.settlements = [];
    this.cities = [];

    this.devCards = {
      owned: {
        knight: 0,
        'road-building': 0,
        'year-of-plenty': 0,
        monopoly: 0,
        'victory-point': 0,
      },
      played: {
        knight: 0,
        'road-building': 0,
        'year-of-plenty': 0,
        monopoly: 0,
        'victory-point': 0,
      },
    };

    this.hasLongestRoad = false;
    this.hasLargestArmy = false;
    this.victoryPoints = 0;
    this.largestArmyCount = 0;
    this.longestRoadCount = 0;
  }

  calculatePlayerPoints(): number {
    return this.victoryPoints + this.devCards.owned['victory-point'];
  }

  hasWon(): boolean {
    return this.calculatePlayerPoints() >= 6;
  }

  addResource(cardType: keyof Resources | string, count: number): void {
    if (cardType in this.resources) this.resources[cardType] += count;
  }

  addResources(resources: Resources) {
    Object.entries(resources).forEach(([resource, count]) => {
      this.addResource(resource, count);
    });
  }

  getPlayerData(): PlayerData {
    return { ...this };
  }

  addSpecialCard(cardType: string): void {
    if (cardType === 'largestArmy') this.hasLargestArmy = true;
    if (cardType === 'longestRoad') this.hasLongestRoad = true;
    this.victoryPoints += 2;
  }

  deductSpecialCard(cardType: string): void {
    if (cardType === 'largestArmy') this.hasLargestArmy = false;
    if (cardType === 'longestRoad') this.hasLongestRoad = false;
    this.victoryPoints -= 2;
  }

  playDevCard(cardType: keyof DevCardTypes) {
    this.devCards.owned[cardType] -= 1;
    this.devCards.played[cardType] += 1;
  }

  addRoad(edgeId: string): void {
    this.roads.push(edgeId);
  }

  addCity(vertexId: string): void {
    this.cities.push(vertexId);
    this.settlements = this.settlements.filter(
      (settlement) => settlement !== vertexId,
    );
  }

  addSettlement(vertexId: string): void {
    this.settlements.push(vertexId);
  }

  updateLongestRoad(count: number) {
    this.longestRoadCount = count;
  }

  dropCard(resource: keyof Resources, count: number) {
    this.resources[resource] -= count;
  }

  dropCards(resources: Resources) {
    Object.entries(resources).forEach(([resource, count]) => {
      this.dropCard(resource, count);
    });
  }
}
