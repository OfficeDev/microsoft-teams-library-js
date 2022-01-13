import { GlobalVars } from '../../src/internal/globalVars';
import { app } from '../../src/public/app';
import { mail } from '../../src/public/mail';
import { Utils } from '../utils';

describe('mail', () => {
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

  describe('openMailItem', () => {
    const openMailItemParams: mail.OpenMailItemParams = {
      itemId: '',
    };

    it('should not allow calls before initialization', async () => {
      await mail
        .openMailItem(openMailItemParams)
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      await mail
        .openMailItem(openMailItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "settings".'),
          ),
        );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      await mail
        .openMailItem(openMailItemParams)
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

      await mail
        .openMailItem(openMailItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "remove".'),
          ),
        );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      await mail
        .openMailItem(openMailItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "task".'),
          ),
        );
    });

    it('should not allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      await mail
        .openMailItem(openMailItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "sidePanel".'),
          ),
        );
    });

    it('should not allow calls from stage context', async () => {
      await utils.initializeWithContext('stage');

      await mail
        .openMailItem(openMailItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "stage".'),
          ),
        );
    });

    it('should not allow calls from meetingStage context', async () => {
      await utils.initializeWithContext('meetingStage');

      await mail
        .openMailItem(openMailItemParams)
        .catch(e =>
          expect(e).toMatchObject(
            new Error('This call is only allowed in following contexts: ["content"]. Current context: "meetingStage".'),
          ),
        );
    });

    it('should not allow calls if runtime does not support mail', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await mail.openMailItem(openMailItemParams).catch(e => expect(e).toBe('Not Supported'));
    });

    it('should successfully throw if the openMailItem message sends and fails', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const openMailItemPromise = mail.openMailItem(openMailItemParams);

      const openMailItemMessage = utils.findMessageByFunc('mail.openMailItem');

      const data = {
        success: false,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(openMailItemMessage, data);
      await openMailItemPromise.catch(e => expect(e).toMatchObject(new Error('Something went wrong...')));
    });

    it('should successfully send the openMailItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const promise = mail.openMailItem(openMailItemParams);

      const openMailItemMessage = utils.findMessageByFunc('mail.openMailItem');

      const data = {
        success: true,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(openMailItemMessage, data);
      await promise;

      expect(openMailItemMessage).not.toBeNull();
      expect(openMailItemMessage.args.length).toEqual(1);
      expect(openMailItemMessage.args[0]).toStrictEqual(openMailItemParams);
    });
  });
});
