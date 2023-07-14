import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { NotificationTypes, ShowNotificationParameters } from '../../src/private/interfaces';
import { notifications } from '../../src/private/notifications';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

const allowedContexts = [FrameContexts.content];
describe('notifications', () => {
  const utils = new Utils();
  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => notifications.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('showNotification', () => {
    const showNotificationParameters: ShowNotificationParameters = {
      message: 'Some Message',
      notificationType: NotificationTypes.fileDownloadStart,
    };
    it('should not allow calls before initialization', () => {
      expect(() => notifications.showNotification(showNotificationParameters)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`showNotification should throw error if notifications capability is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect.assertions(1);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            notifications.showNotification(showNotificationParameters);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`showNotification should successfully send message to parent. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          notifications.showNotification(showNotificationParameters);
          const returnFocusMessage = utils.findMessageByFunc('notifications.showNotification');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(showNotificationParameters);
        });
      } else {
        it(`notifications.showNotification should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => notifications.showNotification(showNotificationParameters)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
