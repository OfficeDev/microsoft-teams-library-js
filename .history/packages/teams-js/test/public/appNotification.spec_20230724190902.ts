import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { appNotification, ErrorCode, FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

// Unit Test cases for AppNotifications API
describe('appNotification', () => {
  let utils = new Utils();
  const allowedContexts = [
    FrameContexts.content,
    FrameContexts.stage,
    FrameContexts.sidePanel,
    FrameContexts.meetingStage,
  ];

  beforeEach(() => {
    utils = new Utils();
    utils.mockWindow.parent = undefined;
    utils.messages = [];
    GlobalVars.isFramelessWindow = false;
  });

  afterEach(() => {
    app._uninitialize();
    GlobalVars.isFramelessWindow = false;
  });

  const displayNotificationParam: appNotification.NotificationDisplayParam = {
    title: 'New Missed Call',
    content: 'You just received a missed call',
    displayDurationInSeconds: 30,
    notificationActionUrl: new URL('https://www.example.com'),
  };

  const displayNotificationParamForAppHost: appNotification.NotificationDisplayParamForAppHost = {
    title: 'New Missed Call',
    content: 'You just received a missed call',
    displayDurationInSeconds: 30,
    notificationActionUrlAsString: 'https://www.example.com/',
  };
 
  

  describe('Testing isSupported function', () => {
    it('should throw if isSupported is called before initialization', () => {
      setUnitializedRuntime();
      expect(() => appNotification.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('Testing displayInAppNotification API', () => {
    it('should not allow displayNotification calls before initialization', () => {
      expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when appNotification is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(1);
          try {
            appNotification.displayInAppNotification(displayNotificationParam);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('displayInAppNotification call with successful result', async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
          const promise = appNotification.displayInAppNotification(displayNotificationParam);
          const message = utils.findMessageByFunc('appNotification.displayNotification');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(displayNotificationParamForAppHost);
          //representation of what hubsdk sends to us in the teamsJS
          const callbackId = message?.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [undefined, null],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toBe(null);
        });

        it('displayInNotification call should not be successful with invalid title length', async () => {
          const maxTitleLength = 75;
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
          const displayNotificationParam: appNotification.NotificationDisplayParam = {
            title:
              'Update: The upcoming maintenance scheduled for tomorrow at 10:00 AM has been extended to include additional server upgrades. Please plan accordingly.',
            content: `
                Dear valued users,
                We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security
                Expected Downtime: Approximately 4 hours.
                We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible.`,
            displayDurationInSeconds: 30,
            notificationActionUrl: new URL('http://www.example.com'),
          };

          expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(
            new Error(
              `Invalid notification title length: Maximum title length ${maxTitleLength}, title length supplied ${displayNotificationParam.title.length}`,
            ),
          );
        });

        it(' should not display notification with zero DurationInSeconds"', async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });

          const displayNotificationParam: appNotification.NotificationDisplayParam = {
            title: 'Update: Maintenance extended to include server upgrades.',
            content:
              `Dear valued users,
            We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security.
            Expected Downtime: Approximately 4 hours.
            We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible.`,
            displayDurationInSeconds: 0,
            notificationActionUrl: new URL('http://www.example.com'),
          };
          expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(
            new Error('Notification display time must be greater than zero'),
          );
        });

        it(' should not display in-app notification with negative DurationInSeconds"', async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });

          const displayNotificationParam: appNotification.NotificationDisplayParam = {
            title: 'Update: Maintenance extended to include server upgrades.',
            content:
              `Dear valued users,
            We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security.
            Expected Downtime: Approximately 4 hours.
            We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible.`,
            displayDurationInSeconds: -1,
            notificationActionUrl: new URL('http://www.example.com'),
          };
          expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(
            new Error('Notification display time must be greater than zero'),
          );
        });

        it('displayInAppNotification call should not be with successful with invalid content length', async () => {
          const maxContentLength = 1500;
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
          const displayNotificationParam: appNotification.NotificationDisplayParam = {
            title: 'New Update: Upcoming maintenance',
            content: `
                     Important Update: The upcoming maintenance scheduled for tomorrow at 10:00 AM has been extended to include additional server upgrades and security enhancements. During this extended maintenance window, we will be implementing the latest security patches and optimizing our infrastructure to provide an even better user experience. As part of these upgrades, we are also introducing new features to improve system performance and reliability.
                     Our team at Microsoft is working diligently to ensure a smooth transition during this maintenance period. We understand the importance of your business operations and are committed to minimizing any disruptions. However, there may be temporary service interruptions during the upgrade process. We apologize for any inconvenience this may cause and appreciate your understanding.
                     We recommend that you plan accordingly for this extended maintenance and notify your team about the possible impact on their work. It is essential to ensure all critical operations are completed before the maintenance window to avoid any potential data loss or service disruptions.
                     Once the maintenance is complete, you can expect enhanced performance, improved stability, and better security measures. Our goal at Microsoft is to provide you with the best possible service, and these upgrades are a crucial step towards achieving that objective.
                     If you have any questions or concerns regarding the upcoming maintenance or its impact on your business, please don't hesitate to contact our support team. We are here to assist you and address any queries you may have.
                     Thank you for your cooperation and continued support as we work to deliver a more robust and secure service. We value your business and are committed to delivering exceptional experiences to all our users.

                     Best regards,
                     Microsoft`,
            displayDurationInSeconds: 30,
            notificationActionUrl: new URL('http://www.example.com'),
          };

          expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(
            new Error(
              `Invalid notification content length: Maximum content length ${maxContentLength}, content length supplied ${displayNotificationParam.content.length}`,
            ),
          );
        });

        it('displayInAppNotification rejects promise with Error when error received from host', async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
          const promise = appNotification.displayInAppNotification(displayNotificationParam);

          const message = utils.findMessageByFunc('appNotification.displayNotification');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(displayNotificationParamForAppHost);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
            },
          } as DOMMessageEvent);
          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        });


      } else {
        it(`should not allow appNotification calls from the wrong context. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
