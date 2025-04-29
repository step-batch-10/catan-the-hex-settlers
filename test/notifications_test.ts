import { beforeEach, describe, it } from 'testing/bdd';
import { Notification } from '../src/models/notification.ts';
import { TradeStatus } from '../src/types.ts';
import { Player } from '../src/models/player.ts';
import { assertEquals } from 'assert/equals';

describe('Notification', () => {
  let notification: Notification;

  beforeEach(() => {
    notification = new Notification();
  })
  
  it('should create open trade notification', () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: false,
      responder: responder,
      proposer: player,
      tradeResource: {
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
      }
    }
    
    const openTradeNotification =  notification.tradeNotification(tradeStatus);
    const expectedHeader = 'Aman opened a Trade';
    const expectedBody = 'Offering 1 Ore for 2 Grain';
    
    assertEquals(openTradeNotification?.header, expectedHeader);
    assertEquals(openTradeNotification?.body, expectedBody);
    assertEquals(openTradeNotification?.actions, ['Accept', 'Reject'])
  })

  it('should create a closed trade notification', () => {
    const player = new Player('p1', 'Aman', 'red');
    const responder = new Player('p2', 'Shabbas', 'Green');

    const tradeStatus: TradeStatus = {
      isClosed: true,
      responder: responder,
      proposer: player,
      tradeResource: {
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
      }
    }
    
    const openTradeNotification =  notification.tradeNotification(tradeStatus);
    
    const expectedHeader = 'Aman traded with Shabbas';
    const expectedBody = 'Exchanged 1 Ore for 2 Grain';

    assertEquals(openTradeNotification?.header, expectedHeader)
    assertEquals(openTradeNotification?.body, expectedBody)
    assertEquals(openTradeNotification?.actions, null)
  })
})
