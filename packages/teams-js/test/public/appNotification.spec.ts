// eslint-disable-next-line prettier/prettier

import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
~1;
import { appNotification, ErrorCode, FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
//import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from '../../src/public/constants';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
~2;
//import { ErrorCode } from '../../src/public/interfaces';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */


// Test cases for Notifications API
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

  const originalDefaultPlatformVersion = '1.6.0';
  const displayNotificationParam: appNotification.NotificationDisplayParam = {
    title: 'New Missed Call',
    content: 'You just received a missed call from Paul Sayer',
    displayDurationInSeconds: 30,
    notificationActionUrl: new URL('https://www.example.com'),
  };

  const displayNotificationParamForAppHost: appNotification.NotificationDisplayParamForAppHost = {
    title: 'New Missed Call',
    content: 'You just received a missed call from Paul Sayer',
    displayDurationInSeconds: 30,
    notificationActionUrlAsString: 'https://www.example.com/',
  };

  describe('Testing isSupported function', () => {
    it('should throw if called before initialization', () => {
      setUnitializedRuntime();
      expect(() => appNotification.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  it('displayInAppNotification call in default version of platform support fails', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
    expect(() => appNotification.displayInAppNotification(displayNotificationParam)).rejects.toEqual(errorNotSupportedOnPlatform);
  });

  describe('Testing displayInAppNotification API', () => {
    it('should not allow displayNotification calls before initialization', () => {
      expect(() => appNotification.displayInAppNotification(displayNotificationParam)).toThrowError(new Error(errorLibraryNotInitialized),
      );
    });
    
    //this checks that the context provided is included in the supported frame contexts for this API

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when appNotification is  not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(1);
          try {
            appNotification.displayInAppNotification(displayNotificationParam);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        //copy    
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
              //instead of true,put in the message to be sent,this is undefined because no message is being sent to the hubsdk
              args: [undefined, null]
            },
          } as DOMMessageEvent);
          //loook up a similar syntax for promise resolution
          //await expect(promise).resolve
          await expect(promise).resolves.toBe(null);
        });


        it('displayInNotification call should not be successful with invalid title length', async () => {
          const maxTitleLength = 75
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });

          // const displayNotificationParam: appNotification.NotificationDisplayParam = {
          //   title: 'Update: The upcoming maintenance scheduled for tomorrow at 10:00 AM has been extended to include additional server upgrades. Please plan accordingly.',
          //   content: 'Dear valued users,We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security Expected Downtime: Approximately 4 hours. We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible',
          //   displayDurationInSeconds: 30,
          //   notificationActionUrl: new URL('http://www.example.com'),
          // }
          const displayNotificationParam: appNotification.NotificationDisplayParam = {
            title: '.',
            content: 'Dear valued users,We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security Expected Downtime: Approximately 4 hours. We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible',
            displayDurationInSeconds: 30,
            notificationActionUrl: new URL('http://www.example.com'),
          }

          await expect(() => appNotification.displayInAppNotification(displayNotificationParam)).rejects.toEqual({
            errorCode: ErrorCode.INVALID_ARGUMENTS,
            message: `Invalid notification title length: Maximum title length ${maxTitleLength}, title length supplied ${displayNotificationParam.title.length}`,
          });
        });


        //working on this still
        /** 
          it('displayInAppNotification call should not be with successful with invalid content length', async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
  
            const displayNotificationParam: appNotification.NotificationDisplayParam = {
              title: 'Update: The upcoming maintenance scheduled for tomorrow at 10:00 AM has been extended to include additional server upgrades. Please plan accordingly.',
              content: 'Dear valued users,We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security Expected Downtime: Approximately 4 hours. We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible',
              displayDurationInSeconds: 30,
              notificationActionUrl: new URL('http://www.example.com'),
            }
            await expect(appNotification.displayInAppNotification(displayNotificationParam)).rejects.toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
            });
          });
        */

        /** 
          it(' should not display in-app notification with zero DurationInSeconds"', async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
  
            const displayNotificationParam: appNotification.NotificationDisplayParam = {
              title: 'Update: Maintenance extended to include server upgrades.',
              content: 'Dear valued users,We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security Expected Downtime: Approximately 4 hours. We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible',
              displayDurationInSeconds: -1,
              notificationActionUrl: new URL('http://www.example.com'),
            }
            await expect(appNotification.displayInAppNotification(displayNotificationParam)).rejects.toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'Notification display time must be greater than zero',
            });
      
          });
        */

        /** 
          it(' should not display in-app notification with negative DurationInSeconds"', async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
  
            const displayNotificationParam: appNotification.NotificationDisplayParam = {
              title: 'Update: Maintenance extended to include server upgrades.',
              content: 'Dear valued users,We would like to inform you that scheduled maintenance will take place on our Microsoft platform tomorrow, August 1st, 2023, starting at 10:00 AM UTC. During this time, Microsoft services will be temporarily unavailable as we perform necessary upgrades to enhance performance and security Expected Downtime: Approximately 4 hours. We apologize for any inconvenience this may cause and assure you that our team at Microsoft is working diligently to complete the maintenance as quickly as possible',
              displayDurationInSeconds: -1,
              notificationActionUrl: new URL('http://www.example.com'),
            }
            await expect(appNotification.displayInAppNotification(displayNotificationParam)).rejects.toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,// message: 'Notification display time must be greater than zero',
            });
          });
        */


        /** 
        //repeat this with an errror code from the webhubsdk
                it('displayInAppNotification call with successful result', async () => {
                  await utils.initializeWithContext(context);
                  utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
                  const promise = appNotification.displayInAppNotification(displayNotificationParam);
        
                  const message = utils.findMessageByFunc('appNotification.displayNotification');
                  expect(message).not.toBeNull();
                  expect(message.args.length).toBe(1);
                  //how do I know what this should be instead
                  expect(message.args[0]).toEqual(displayNotificationParam);
        
                  //representation of what hubsdk sends
                  const callbackId = message?.id;
                  utils.respondToFramelessMessage({
                    data: {
                      id: callbackId,
                      //instead of true,put in the message to be sent
                      args: [undefined,null]
                      // repeat this with an error code;with a kind of error code that could come from webhubsdk
        
                    },
                  } as DOMMessageEvent);
                  await expect(promise).resolves.toBe(true);
                });
              */

        it('displayInAppNotification rejects promise with Error when error received from host', async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { appNotification: {} } });
          const promise = appNotification.displayInAppNotification(displayNotificationParam);

          const message = utils.findMessageByFunc('appNotification.displayNotification');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          //what does this line really mean?
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

      }

      else {
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








