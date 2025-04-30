import {
  NotificationMessage,
  Resources,
  Trader,
  TradeStatus,
} from '../types.ts';
import _ from 'lodash';
import { Player } from './player.ts';

type ExpFn = (notification: NotificationMessage, seconds: number) => void;

export const setExpiry = (
  notification: NotificationMessage,
  seconds: number,
) => {
  const timerId = setTimeout(() => {
    notification.expired = true;
    clearTimeout(timerId);
  }, seconds * 1000);
};

export class Notification {
  private notifications: { [id: number]: NotificationMessage };
  private setExpiry: ExpFn;

  constructor(expiryFn: ExpFn) {
    this.notifications = {};
    this.setExpiry = expiryFn;
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
  ): NotificationMessage {
    const header = `${proposer.name} traded with ${responder.name}`;
    const body = `Exchanged ${outResourceString} for ${inResourceString}`;
    const notification = { header, body, actions: null, expired: false };
    this.setExpiry(notification, 1);

    return notification;
  }

  private createOpenTM(
    proposer: Player,
    outResourceString: string,
    inResourceString: string,
  ): NotificationMessage {
    const header = `${proposer.name} opened a Trade`;
    const body = `Offering ${outResourceString} for ${inResourceString}`;
    const actions = ['Accept'];

    const notification = { header, body, actions, expired: false };

    return notification;
  }

  tradeNotification(tradeStatus: TradeStatus) {
    const { isClosed, proposer, tradeResources, tradeId } = tradeStatus;
    const { outgoingResources, incomingResources } = tradeResources;

    const outResourceString = this.stringifyResourceAndCount(outgoingResources);
    const inResourceString = this.stringifyResourceAndCount(incomingResources);

    let notification = this.createOpenTM(
      proposer,
      outResourceString,
      inResourceString,
    );

    if (isClosed) {
      const responder = tradeStatus.responder as Trader;
      notification = this.createClosedTM(
        proposer,
        responder,
        outResourceString,
        inResourceString,
      );
    }

    this.notifications[tradeId] = notification;

    return;
  }

  getNewNotifications() {
    const notifications = this.notifications;
    return _.filter(notifications, { expired: false });
  }

  expireNotification(notificationId: number) {
    const notification = this.notifications[notificationId];
    notification.expired = true;
  }
}
