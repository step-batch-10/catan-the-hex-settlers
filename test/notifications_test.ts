import { beforeEach, describe, it } from 'testing/bdd';
import { Notification, setExpiry } from '../src/models/notification.ts';
import { NotificationMessage, TradeStatus } from '../src/types.ts';
import { Player } from '../src/models/player.ts';
import { assertEquals } from 'assert/equals';

describe('Notification', () => {
  let notification: Notification;
  let timerId: number;

  const wait = (time: number) => {
    return new Promise((res, _):void => {
      const timerId = setTimeout(() => {
        clearTimeout(timerId);
        res("");
      }, time * 1000)
    })
  }

  beforeEach(() => {
    const setExpiry = function (notification: NotificationMessage, _seconds: number) {
      timerId = setTimeout(() => {
        notification.expired = true;
      }, 1 * 1000)
    }
    notification = new Notification(setExpiry);
  })
  
  it('should create open trade notification', () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: false,
      responder: responder,
      proposer: player,
      tradeResources: {
        incomingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 2,
          ore: 0
        },
        outgoingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 0,
          ore: 1
        }
      },
      tradeId: 0
    }
    
    notification.tradeNotification(tradeStatus);
    const openTradeNotification = notification.getNewNotifications()[0];
    const expectedHeader = 'Aman opened a Trade';
    const expectedBody = 'Offering 1 Ore for 2 Grain';
    
    assertEquals(openTradeNotification?.header, expectedHeader);
    assertEquals(openTradeNotification?.body, expectedBody);
    assertEquals(openTradeNotification?.actions, ['Accept'])
  })

  it('should create a closed trade notification', () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: true,
      responder: responder,
      proposer: player,
      tradeResources: {
        incomingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 2,
          ore: 0
        },
        outgoingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 0,
          ore: 1
        }
      },
      tradeId: 0
    }
    notification.tradeNotification(tradeStatus);
    const openTradeNotification = notification.getNewNotifications()[0]
    
    clearTimeout(timerId);
    
    const expectedHeader = 'Aman traded with Shabbas';
    const expectedBody = 'Exchanged 1 Ore for 2 Grain';

    assertEquals(openTradeNotification?.header, expectedHeader)
    assertEquals(openTradeNotification?.body, expectedBody)
    assertEquals(openTradeNotification?.actions, null)
  })

  it('should give all the unexpired notifications', () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: false,
      responder: responder,
      proposer: player,
      tradeResources: {
        incomingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 2,
          ore: 0
        },
        outgoingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 0,
          ore: 1
        }
      },
      tradeId: 0
    }
    notification.tradeNotification(tradeStatus);
    const newNotification =  notification.getNewNotifications()[0]
    
    const expectedHeader = 'Aman opened a Trade';
    const expectedBody = 'Offering 1 Ore for 2 Grain';

    assertEquals(newNotification?.header, expectedHeader)
    assertEquals(newNotification?.body, expectedBody)
    assertEquals(newNotification?.actions, ['Accept'])
  })

  it('should not give expired notifications', async () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: true,
      responder: responder,
      proposer: player,
      tradeResources: {
        incomingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 2,
          ore: 0
        },
        outgoingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 0,
          ore: 1
        }
      },
      tradeId: 0
    }
    
    notification.tradeNotification(tradeStatus);
    await wait(1)
    const newNotification = notification.getNewNotifications()[0];

    assertEquals(newNotification, undefined);
  })

  it('should assert the expiry into true after some time', async () => {
    const notificationMessage: NotificationMessage = {
      expired: false,
      header: '',
      body: '',
      actions: null
    };

    setExpiry(notificationMessage, 1);
    await wait(1.1);
    
    assertEquals(notificationMessage.expired, true)
  })

  it('should give all the unexpired notifications', () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: false,
      responder: responder,
      proposer: player,
      tradeResources: {
        incomingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 2,
          ore: 0
        },
        outgoingResources: {
          lumber: 0,
          brick: 0,
          wool: 0,
          grain: 0,
          ore: 1
        }
      },
      tradeId: 1000
    }
    notification.tradeNotification(tradeStatus);
    notification.expireNotification(tradeStatus.tradeId);
    const newNotification =  notification.getNewNotifications()[0]

    assertEquals(newNotification, undefined)
  })
})
