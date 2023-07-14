import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { calendar } from '../../src/public/calendar';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { validateCalendarDeepLinkPrefix } from '../internal/deepLinkUtilities.spec';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('calendar', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    GlobalVars.frameContext = undefined;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('openCalendarItem', () => {
    const openCalendarItemParams: calendar.OpenCalendarItemParams = {
      itemId: '1',
    };

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
    });

    Object.keys(FrameContexts)
      .map((k) => FrameContexts[k])
      .forEach((frameContext) => {
        it(`should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }

          expect.assertions(1);

          await utils.initializeWithContext(frameContext);

          await calendar
            .openCalendarItem(openCalendarItemParams)
            .catch((e) =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
                ),
              ),
            );
        });
      });

    it('should not allow calls if runtime does not support calendar', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await expect(calendar.openCalendarItem(openCalendarItemParams)).rejects.toThrowError('Not supported');
    });

    it('should throw if a null itemId is supplied', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      await calendar
        .openCalendarItem({ itemId: null })
        .catch((e) => expect(e).toMatchObject(new Error('Must supply an itemId to openCalendarItem')));
    });

    it('should throw if an undefined itemId is supplied', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      await calendar
        .openCalendarItem({ itemId: undefined })
        .catch((e) => expect(e).toMatchObject(new Error('Must supply an itemId to openCalendarItem')));
    });

    it('should throw if an empty itemId is supplied', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      await calendar
        .openCalendarItem({ itemId: '' })
        .catch((e) => expect(e).toMatchObject(new Error('Must supply an itemId to openCalendarItem')));
    });

    it('should throw if the openCalendarItem message sends and fails', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const openCalendarItemPromise = calendar.openCalendarItem(openCalendarItemParams);

      const openCalendarItemMessage = utils.findMessageByFunc('calendar.openCalendarItem');

      const data = {
        success: false,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(openCalendarItemMessage, data.success, data.error);

      await openCalendarItemPromise.catch((e) => expect(e).toMatchObject(new Error('Something went wrong...')));
    });

    it('should successfully send the openCalendarItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const openCalendarItemPromise = calendar.openCalendarItem(openCalendarItemParams);

      const openCalendarItemMessage = utils.findMessageByFunc('calendar.openCalendarItem');

      const data = {
        success: true,
      };

      utils.respondToMessage(openCalendarItemMessage, data.success);
      await openCalendarItemPromise;

      expect(openCalendarItemMessage).not.toBeNull();
      expect(openCalendarItemMessage.args.length).toEqual(1);
      expect(openCalendarItemMessage.args[0]).toStrictEqual(openCalendarItemParams);
    });

    it('should resolve promise after successfully sending the openCalendarItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const openCalendarItemPromise = calendar.openCalendarItem(openCalendarItemParams);

      const openCalendarItemMessage = utils.findMessageByFunc('calendar.openCalendarItem');

      const data = {
        success: true,
      };

      utils.respondToMessage(openCalendarItemMessage, data.success);
      await expect(openCalendarItemPromise).resolves.not.toThrow();
    });
  });

  describe('composeMeeting', () => {
    const composeMeetingParams: calendar.ComposeMeetingParams = {};

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
    });

    Object.keys(FrameContexts)
      .map((k) => FrameContexts[k])
      .forEach((frameContext) => {
        it(`should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }

          expect.assertions(1);

          await utils.initializeWithContext(frameContext);

          await calendar
            .composeMeeting(composeMeetingParams)
            .catch((e) =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
                ),
              ),
            );
        });
      });

    it('should not allow calls if runtime does not support calendar', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await expect(calendar.composeMeeting(composeMeetingParams)).rejects.toThrowError('Not supported');
    });

    it('should successfully throw if the composeMeeting message sends and fails', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const composeMeetingPromise = calendar.composeMeeting(composeMeetingParams);
      const composeMeeting = utils.findMessageByFunc('calendar.composeMeeting');

      const data = {
        success: false,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(composeMeeting, data.success, data.error);

      await composeMeetingPromise.catch((e) => expect(e).toMatchObject(new Error('Something went wrong...')));
    });

    it('should successfully send the composeMeeting message: Non-legacy host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { calendar: {} } });

      const composeMeetingPromise = calendar.composeMeeting(composeMeetingParams);
      const composeMeetingMessage = utils.findMessageByFunc('calendar.composeMeeting');

      const data = {
        success: true,
      };

      utils.respondToMessage(composeMeetingMessage, data.success);
      await composeMeetingPromise;

      expect(composeMeetingMessage).not.toBeNull();
      expect(composeMeetingMessage.args.length).toEqual(1);
      expect(composeMeetingMessage.args[0]).toStrictEqual(composeMeetingParams);
    });

    it('should successfully send the composeMeeting message: Legacy host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: true, supports: { calendar: {} } });

      const promise = calendar.composeMeeting(composeMeetingParams);
      const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');

      expect(executeDeepLinkMessage).not.toBeNull();
      expect(executeDeepLinkMessage.args).toHaveLength(1);

      const calendarDeepLink: URL = new URL(executeDeepLinkMessage.args[0] as string);
      validateCalendarDeepLinkPrefix(calendarDeepLink);

      utils.respondToMessage(executeDeepLinkMessage, true);
      await expect(promise).resolves.not.toThrow();
    });

    it('should resolve promise after successfully sending the composeMeeting message: Non-legacy host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { calendar: {} } });

      const composeMeetingPromise = calendar.composeMeeting(composeMeetingParams);

      const composeMeetingMessage = utils.findMessageByFunc('calendar.composeMeeting');

      const data = {
        success: true,
      };

      utils.respondToMessage(composeMeetingMessage, data.success);
      await expect(composeMeetingPromise).resolves.not.toThrow();
    });

    it('should resolve promise after successfully sending the composeMeeting message: Legacy host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: true, supports: { calendar: {} } });

      const composeMeetingPromise = calendar.composeMeeting(composeMeetingParams);

      const composeMeetingMessage = utils.findMessageByFunc('executeDeepLink');

      const data = {
        success: true,
      };

      utils.respondToMessage(composeMeetingMessage, data.success);
      await expect(composeMeetingPromise).resolves.not.toThrow();
    });
  });
  describe('isSupported', () => {
    it('should return false if the runtime says calendar is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(calendar.isSupported()).not.toBeTruthy();
    });

    it('should return true if the runtime says calendar is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });
      expect(calendar.isSupported()).toBeTruthy();
    });

    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => calendar.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });
});
