import {
  ExpectedResponder,
  Trader,
  TradeResources,
  TradeStatus,
} from '../types.ts';
import { Bank } from './bank.ts';
import { Player } from './player.ts';

export class Trade {
  expectedResponder: ExpectedResponder;
  proposer: Player;
  responder: Trader | null;
  tradeResources: TradeResources;
  isClosed: boolean;

  constructor(
    expectedResponder: ExpectedResponder,
    proposer: Player,
    tradeResources: TradeResources,
  ) {
    this.expectedResponder = expectedResponder;
    this.proposer = proposer;
    this.tradeResources = tradeResources;
    this.isClosed = false;
    this.responder = null;
  }

  getStatus(): TradeStatus {
    return {
      isClosed: this.isClosed,
      proposer: this.proposer,
      responder: this.responder,
      tradeResources: this.tradeResources,
    };
  }

  closeTrade(responder: Trader) {
    this.responder = responder;

    this.responder.addResources(this.tradeResources.outgoingResources);
    this.responder.dropCards(this.tradeResources.incomingResources);

    this.proposer.addResources(this.tradeResources.incomingResources);
    this.proposer.dropCards(this.tradeResources.outgoingResources);

    this.isClosed = true;

    return this.getStatus();
  }
}

export class TradeManager {
  trades: Trade[];
  runningTrade: Trade | null;
  bank: Bank;

  constructor() {
    this.trades = [];
    this.runningTrade = null;
    this.bank = new Bank({
      wool: 4,
      lumber: 4,
      brick: 4,
      grain: 4,
      ore: 4,
    });
  }

  openNewTrade(
    expectedResponder: ExpectedResponder,
    proposer: Player,
    tradeResources: TradeResources,
  ) {
    const currentTrade = new Trade(expectedResponder, proposer, tradeResources);
    this.runningTrade = currentTrade;
    this.trades.push(currentTrade);

    if (expectedResponder === 'bank') {
      return this.closeTrade(this.bank);
    }

    return this.getCurrentTradeStatus();
  }

  closeTrade(responder: Trader) {
    const closedTradeStatus = this.runningTrade?.closeTrade(responder);
    this.runningTrade = null;

    return closedTradeStatus;
  }

  getCurrentTradeStatus() {
    return this.runningTrade?.getStatus();
  }
}
