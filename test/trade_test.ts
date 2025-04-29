import { beforeEach, describe, it } from 'testing/bdd';
import { TradeManager } from '../src/models/trade.ts';
import { Player } from '../src/models/player.ts';
import { Resources, TradeResources } from '../src/types.ts';
import { assertEquals } from 'assert/equals';
import { assert } from 'assert/assert';

describe('Trade', () => {
  let trades:TradeManager;

  beforeEach(() => {
    trades = new TradeManager();
  })
  
  it('should open new trade with bank and close it immediately', () => {
    const player = new Player("p1", "Aman", "red");
    

    const tradeResources: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0
      }
    }

    const tradeStatus = trades.openNewTrade('bank', player, tradeResources);

    assertEquals(tradeStatus?.isClosed, true);
    assertEquals(tradeStatus?.proposer, player);
    assertEquals(tradeStatus?.responder, trades.bank);
    assertEquals(tradeStatus?.tradeResources, tradeResources);
    assertEquals(trades.trades.at(-1)?.expectedResponder, 'bank');
  })

  it('should open new trade with player', () => {
    const proposer = new Player('p2', 'Shabbas', 'green');

    const tradeResources: TradeResources = {
      incomingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0
      }
    }

    trades.openNewTrade('player', proposer, tradeResources);

    const tradeStatus = trades.getCurrentTradeStatus();

    assertEquals(tradeStatus?.isClosed, false)
    assertEquals(tradeStatus?.proposer, proposer)
    assertEquals(tradeStatus?.responder, null)
    assertEquals(tradeStatus?.tradeResources, tradeResources)
    assertEquals(trades.runningTrade?.expectedResponder, 'player')
  })

  it("should close a open trade with player", () => {
    const proposer = new Player('p2', 'Shabbas', 'green');
    const player = new Player("p1", "Aman", "red");

    const tradeResources: TradeResources = {
      incomingResources: {
        lumber: 2,
        brick: 0,
        wool: 0,
        grain: 0,
        ore: 0
      },
      outgoingResources: {
        lumber: 0,
        brick: 0,
        wool: 0,
        grain: 2,
        ore: 0
      }
    }

    trades.openNewTrade('player', proposer, tradeResources);

    const closedTradeStatus = trades.closeTrade(player)
    const expectedProposerRes: Resources = {
      lumber: 2,
      brick: 0,
      wool: 0,
      grain: -2,
      ore: 0
    }

    const expectedResponderRes: Resources = {
      lumber: -2,
      brick: 0,
      wool: 0,
      grain: 2,
      ore: 0
    }

    assert(closedTradeStatus?.isClosed);
    assertEquals(proposer.resources, expectedProposerRes);
    assertEquals(player.resources, expectedResponderRes);
  })
})