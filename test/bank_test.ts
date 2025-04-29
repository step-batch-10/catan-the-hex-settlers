import { beforeEach, describe, it } from 'testing/bdd';
import { Bank } from '../src/models/bank.ts';
import { assertEquals } from 'assert/equals';
import { Resources } from '../src/types.ts';

describe('addResources', () => {
  let bank: Bank;
  beforeEach(() => {
    const initialResources: Resources = {
      wool: 4,
      lumber: 4,
      brick: 4,
      grain: 4,
      ore: 4,
    };
    bank = new Bank(initialResources);
  });

  it('should add resources to the bank assets', () => {
    const resourcesToAdd: Resources = {
      lumber: 2,
      brick: 0,
      wool: 0,
      grain: 2,
      ore: 0,
    };
    bank.addResources(resourcesToAdd);

    const expectedFinalResources: Resources = {
      lumber: 6,
      brick: 4,
      wool: 4,
      grain: 6,
      ore: 4,
    };
    assertEquals(bank.getAssets(), expectedFinalResources);
  });

  it('should remove resource from bank assets', () => {
    const resourcesToDrop: Resources = {
      lumber: 0,
      brick: 0,
      wool: 2,
      grain: 0,
      ore: 2,
    };

    bank.dropCards(resourcesToDrop);

    const expectedFinalResources: Resources = {
      lumber: 4,
      brick: 4,
      wool: 2,
      grain: 4,
      ore: 2,
    };

    assertEquals(bank.getAssets(), expectedFinalResources);
  });
});
