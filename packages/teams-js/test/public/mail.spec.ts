import { GlobalVars } from '../../src/internal/globalVars';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { mail } from '../../src/public/mail';
import { Utils } from '../utils';

const dataError = 'Something went wrong...';

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

    Object.keys(FrameContexts)
      .map(k => FrameContexts[k])
      .forEach(frameContext => {
        it(`should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }

          await utils.initializeWithContext(frameContext);

          await mail
            .openMailItem(openMailItemParams)
            .catch(e =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
                ),
              ),
            );
        });
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
        error: dataError,
      };

      utils.respondToMessage(openMailItemMessage, data);
      await openMailItemPromise.catch(e => expect(e).toMatchObject(new Error(dataError)));
    });

    it('should successfully send the openMailItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const promise = mail.openMailItem(openMailItemParams);

      const openMailItemMessage = utils.findMessageByFunc('mail.openMailItem');

      const data = {
        success: true,
        error: dataError,
      };

      utils.respondToMessage(openMailItemMessage, data);
      await promise;

      expect(openMailItemMessage).not.toBeNull();
      expect(openMailItemMessage.args.length).toEqual(1);
      expect(openMailItemMessage.args[0]).toStrictEqual(openMailItemParams);
    });

    it('should resolve promise after sending successful openMailItem message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const promise = mail.openMailItem(openMailItemParams);

      const openMailItemMessage = utils.findMessageByFunc('mail.openMailItem');

      const data = {
        success: true,
        error: dataError,
      };

      utils.respondToMessage(openMailItemMessage, data);

      expect(promise).resolves;
    });
  });

  describe('composeMail', () => {
    const composeMailParams: mail.ComposeMailParams = {
      type: mail.ComposeMailType.New,
    };

    it('should not allow calls before initialization', async () => {
      await mail
        .composeMail(composeMailParams)
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    Object.keys(FrameContexts)
      .map(k => FrameContexts[k])
      .forEach(frameContext => {
        it(`should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }

          await utils.initializeWithContext(frameContext);

          await mail
            .composeMail(composeMailParams)
            .catch(e =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
                ),
              ),
            );
        });
      });

    it('should not allow calls if runtime does not support mail', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await mail.composeMail(composeMailParams).catch(e => expect(e).toBe('Not Supported'));
    });

    it('should successfully throw if the openMailItem message sends and fails', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const composeMailPromise = mail.composeMail(composeMailParams);

      const composeMail = utils.findMessageByFunc('mail.composeMail');

      const data = {
        success: false,
        error: dataError,
      };

      utils.respondToMessage(composeMail, data);
      await composeMailPromise.catch(e => expect(e).toMatchObject(new Error(dataError)));
    });

    it('should successfully send the composeMail message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const promise = mail.composeMail(composeMailParams);

      const composeMailMessage = utils.findMessageByFunc('mail.composeMail');

      const data = {
        success: true,
        error: dataError,
      };

      utils.respondToMessage(composeMailMessage, data);
      await promise;

      expect(composeMailMessage).not.toBeNull();
      expect(composeMailMessage.args.length).toEqual(1);
      expect(composeMailMessage.args[0]).toStrictEqual(composeMailParams);
    });

    it('should resolve promise after successfully sending the composeMail message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });

      const promise = mail.composeMail(composeMailParams);

      const composeMailMessage = utils.findMessageByFunc('mail.composeMail');

      const data = {
        success: true,
        error: dataError,
      };

      utils.respondToMessage(composeMailMessage, data);
      expect(promise).resolves;
    });
  });

  describe('isSupported', () => {
    it('should return false if the runtime says mail is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(mail.isSupported()).not.toBeTruthy();
    });

    it('should return true if the runtime says mail is supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: { mail: {} } });
      expect(mail.isSupported()).toBeTruthy();
    });
  });
});
