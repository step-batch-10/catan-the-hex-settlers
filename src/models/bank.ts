import { Resources } from '../types.ts';

export class Bank {
  private assets: Resources;
  name: string = 'Bank';

  constructor(assets: Resources) {
    this.assets = assets;
  }

  addResource(cardType: keyof Resources | string, count: number): void {
    if (cardType in this.assets) this.assets[cardType] += count;
  }

  addResources(resources: Resources) {
    Object.entries(resources).forEach(
      ([resource, count]) => {
        this.addResource(resource, count);
      },
    );
  }

  dropCard(resource: keyof Resources, count: number) {
    this.assets[resource] -= count;
  }

  dropCards(resources: Resources) {
    Object.entries(resources).forEach(([resource, count]) => {
      this.dropCard(resource, count);
    });
  }

  getAssets() {
    return this.assets;
  }
}
