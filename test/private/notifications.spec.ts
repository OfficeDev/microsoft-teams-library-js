import { notifications } from '../../src/private/notifications';
import { Utils } from '../utils';
import { _uninitialize } from '../../src/public/publicAPIs';
import { NotificationPayload } from '../../src/public/interfaces';

describe('logs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();
  const notificationPayload: NotificationPayload =  {
    payload : "{ \"eventId\" : 1500,  \"environment\" : \"Production\"}", 
    subPath : 'shifts'
  }

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('registerTrouterNotificagions', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
      notifications.registerTrouterNotifications((notificationPayload) => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully register a notification handler', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      notifications.registerTrouterNotifications((notificationPayload) => {
        handlerInvoked = true;
        return;
      });

      utils.sendMessage('trouter.notificationRecieved');
      expect(handlerInvoked).toBe(true);
    });

    it('notification recieved should call the notification handler and send the notification payload', () => {
      utils.initializeWithContext('content');
    
      let handlerInvoked = jest.fn();
      notifications.registerTrouterNotifications((notifications: NotificationPayload) => {
        handlerInvoked(notificationPayload);
      });

      utils.sendMessage('trouter.notificationRecieved');
      expect(handlerInvoked).toBeCalledWith(notificationPayload);
    });

    it('should not send notifications when no notification handler is registered', () => {
      utils.initializeWithContext('content');
      let handlerInvoked = jest.fn();

      utils.sendMessage('trouter.notificationRecieved');

      expect(handlerInvoked).not.toBeCalled();
    });
  });
});
