import { beforeEach, describe, it } from 'testing/bdd';
import { TradeManager } from '../src/models/trade.ts';
import { Bank } from '../src/models/bank.ts';
import { Player } from '../src/models/player.ts';
import { TradeResources } from '../src/types.ts';
import { assertEquals } from 'assert/equals';

describe('Trade', () => {
  let trades:TradeManager;

  beforeEach(() => {
    trades = new TradeManager();
  })
  
  it('should open new trade bank', () => {
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

    trades.openNewTrade(Bank, player, tradeResources);

    const tradeStatus = trades.getCurrentTradeStatus();

    assertEquals(tradeStatus?.isClosed, false)
    assertEquals(tradeStatus?.proposer, player)
    assertEquals(tradeStatus?.responder, null)
    assertEquals(tradeStatus?.tradeResources, tradeResources)
  })

  it('should open new trade bank', () => {
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

    trades.openNewTrade(Player, proposer, tradeResources);

    const tradeStatus = trades.getCurrentTradeStatus();

    assertEquals(tradeStatus?.isClosed, false)
    assertEquals(tradeStatus?.proposer, proposer)
    assertEquals(tradeStatus?.responder, null)
    assertEquals(tradeStatus?.tradeResources, tradeResources)
  })

  it("should close a open trade", () => {
    const proposer = new Player('p2', 'Shabbas', 'green');
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

    trades.openNewTrade(Player, proposer, tradeResources);

    trades.closeTrade(player)
  })
})