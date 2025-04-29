import { ExpectedResponder, Trader, TradeResources,  } from '../types.ts';
import { Player } from './player.ts';

export class Trade {
  expectedResponder: ExpectedResponder;
  proposer: Trader;
  responder: Trader | null;
  tradeResources: TradeResources;
  isClosed: boolean;

  constructor(
    expectedResponder: ExpectedResponder,
    proposer: Trader,
    tradeResources: TradeResources,
  ) {
    this.expectedResponder = expectedResponder;
    this.proposer = proposer;
    this.tradeResources = tradeResources;
    this.isClosed = false;
    this.responder = null;
  }

  getStatus() {
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

  constructor() {
    this.trades = [];
    this.runningTrade = null;
  }

  openNewTrade(
    expectedResponder: ExpectedResponder,
    proposer: Player,
    tradeResources: TradeResources,
  ) {
    const currentTrade = new Trade(expectedResponder, proposer, tradeResources);
    this.runningTrade = currentTrade;
    this.trades.push(currentTrade);
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
