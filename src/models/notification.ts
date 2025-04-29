import {
  NotificationMessage,
  Resources,
  Trader,
  TradeStatus,
} from '../types.ts';
import _ from 'lodash';
import { Player } from './player.ts';

export class Notification {
  notifications: NotificationMessage[];

  constructor() {
    this.notifications = [];
  }

  private stringifyResourceAndCount(resources: Resources) {
    return _.chain(resources)
      .pickBy((v: number) => v > 0)
      .map((v: number, k: string) => `${v} ${_.capitalize(k)}`)
      .value();
  }

  private createClosedTM(
    proposer: Player,
    responder: Trader,
    outResourceString: string,
    inResourceString: string,
  ) {
    const header = `${proposer.name} traded with ${responder.name}`;
    const body = `Exchanged ${outResourceString} for ${inResourceString}`;

    return { header, body, actions: null };
  }

  createOpenTM(
    proposer: Player,
    outResourceString: string,
    inResourceString: string,
  ) {
    const header = `${proposer.name} opened a Trade`;
    const body = `Offering ${outResourceString} for ${inResourceString}`;
    const actions = ['Accept', 'Reject'];

    return { header, body, actions };
  }

  tradeNotification(tradeStatus: TradeStatus) {
    const isClosed = tradeStatus.isClosed;
    const proposer = tradeStatus.proposer;
    const responder = tradeStatus.responder;
    const outgoingResources = tradeStatus.tradeResource.outgoingResources;
    const incomingResources = tradeStatus.tradeResource.incomingResources;

    const outResourceString = this.stringifyResourceAndCount(outgoingResources);
    const inResourceString = this.stringifyResourceAndCount(incomingResources);

    if (isClosed) {
      return this.createClosedTM(
        proposer,
        responder,
        outResourceString,
        inResourceString,
      );
    }

    return this.createOpenTM(
      proposer,
      outResourceString,
      inResourceString,
    );
  }
}
