import { GlobalVars } from '../../src/internal/globalVars';
import { app } from '../../src/public/app';
import { calendar } from '../../src/public/calendar';
import { Utils } from '../utils';

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
      app._uninitialize();
    }
  });

  describe('openCalendarItem', () => {
    const openCalendarItemParams: calendar.OpenCalendarItemParams = {
      itemId: '',
    };

    it('should not allow calls before initialization', async () => {
      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "settings".'),
          ),
        );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error(
              'This call is only allowed in following contexts: ["content"]. Current context: "authentication".',
            ),
          ),
        );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "remove".'),
          ),
        );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "task".'),
          ),
        );
    });

    it('should not allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "sidePanel".'),
          ),
        );
    });

    it('should not allow calls from stage context', async () => {
      await utils.initializeWithContext('stage');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "stage".'),
          ),
        );
    });

    it('should not allow calls from meetingStage context', async () => {
      await utils.initializeWithContext('meetingStage');

      await calendar
        .openCalendarItem(openCalendarItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "meetingStage".'),
          ),
        );
    });

    it('should not allow calls if runtime does not support calendar', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await calendar.openCalendarItem(openCalendarItemParams).catch(e => expect(e).toBe('Not Supported'));
    });

    it('should successfully throw if the openMailItem message sends and fails', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const openCalendarItemPromise = calendar.openCalendarItem(openCalendarItemParams);

      const openCalendarItemMessage = utils.findMessageByFunc('calendar.openCalendarItem');

      const data = {
        success: false,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(openCalendarItemMessage, data);
      await openCalendarItemPromise.catch(e => expect(e).toMatchObject(new Error('Something went wrong...')));
    });

    it('should successfully send the openMailItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const openCalendarItemPromise = calendar.openCalendarItem(openCalendarItemParams);

      const openCalendarItemMessage = utils.findMessageByFunc('calendar.openCalendarItem');

      const data = {
        success: true,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(openCalendarItemMessage, data);
      await openCalendarItemPromise;

      expect(openCalendarItemMessage).not.toBeNull();
      expect(openCalendarItemMessage.args.length).toEqual(1);
      expect(openCalendarItemMessage.args[0]).toStrictEqual(openCalendarItemParams);
    });
  });

  describe('composeMeeting', () => {
    const composeMeetingParams: calendar.ComposeMeetingParams = {};

    it('should not allow calls before initialization', async () => {
      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "settings".'),
          ),
        );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error(
              'This call is only allowed in following contexts: ["content"]. Current context: "authentication".',
            ),
          ),
        );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "remove".'),
          ),
        );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "task".'),
          ),
        );
    });

    it('should not allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "sidePanel".'),
          ),
        );
    });

    it('should not allow calls from stage context', async () => {
      await utils.initializeWithContext('stage');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "stage".'),
          ),
        );
    });

    it('should not allow calls from meetingStage context', async () => {
      await utils.initializeWithContext('meetingStage');

      await calendar
        .composeMeeting(composeMeetingParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "meetingStage".'),
          ),
        );
    });

    it('should not allow calls if runtime does not support mail', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await calendar.composeMeeting(composeMeetingParams).catch(e => expect(e).toBe('Not Supported'));
    });

    it('should successfully throw if the openMailItem message sends and fails', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const composeMeetingPromise = calendar.composeMeeting(composeMeetingParams);

      const composeMeeting = utils.findMessageByFunc('calendar.composeMeeting');

      const data = {
        success: false,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(composeMeeting, data);
      await composeMeetingPromise.catch(e => expect(e).toMatchObject(new Error('Something went wrong...')));
    });

    it('should successfully send the openMailItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });

      const composeMeetingPromise = calendar.composeMeeting(composeMeetingParams);

      const composeMeetingMessage = utils.findMessageByFunc('calendar.composeMeeting');

      const data = {
        success: true,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(composeMeetingMessage, data);
      await composeMeetingPromise;

      expect(composeMeetingMessage).not.toBeNull();
      expect(composeMeetingMessage.args.length).toEqual(1);
      expect(composeMeetingMessage.args[0]).toStrictEqual(composeMeetingParams);
    });
  });

  describe('isSupported', () => {
    it('should return false if the runtime says calendar is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(calendar.isSupported()).not.toBeTruthy();
    });

    it('should return true if the runtime says mail is supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: { calendar: {} } });
      expect(calendar.isSupported()).toBeTruthy();
    });
  });
});
