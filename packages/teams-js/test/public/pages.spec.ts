import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { pages } from '../../src/public/pages';
import { Utils } from '../utils';

describe('AppSDK-TeamsAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('navigateToApp', () => {
    const navigateToAppParams: pages.NavigateToAppParams = {
      appId: 'fe4a8eba-2a31-4737-8e33-e5fae6fee194',
      pageId: 'tasklist123',
      webUrl: 'https://tasklist.example.com/123',
      channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
      subPageId: 'task456',
    };

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);
      await pages
        .navigateToApp(navigateToAppParams)
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    ];

    Object.keys(FrameContexts).forEach(k => {
      const context = FrameContexts[k];
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should allow calls from ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

          const promise = pages.navigateToApp(navigateToAppParams);

          const navigateToAppMessage = utils.findMessageByFunc('pages.navigateToApp');
          utils.respondToMessage(navigateToAppMessage, true);

          return expect(promise).resolves.toBe(undefined);
        });
      } else {
        it(`should not allow calls from ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);

          await pages
            .navigateToApp(navigateToAppParams)
            .catch(e =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ["content","sidePanel","settings","task","stage","meetingStage"]. Current context: "${context}".`,
                ),
              ),
            );
        });
      }
    });

    it('should successfully send the navigateToApp message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

      const promise = pages.navigateToApp(navigateToAppParams);

      const navigateToAppMessage = utils.findMessageByFunc('pages.navigateToApp');
      utils.respondToMessage(navigateToAppMessage, true);
      await promise;

      expect(navigateToAppMessage).not.toBeNull();
      expect(navigateToAppMessage.args[0]).toStrictEqual(navigateToAppParams);
    });

    it('should successfully send an executeDeepLink message for legacy teams clients', async () => {
      await utils.initializeWithContext('content');

      const promise = pages.navigateToApp(navigateToAppParams);

      const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
      utils.respondToMessage(executeDeepLinkMessage, true);
      await promise;

      expect(executeDeepLinkMessage).not.toBeNull();
      expect(executeDeepLinkMessage.args[0]).toBe(
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?webUrl=https%3A%2F%2Ftasklist.example.com%2F123&context=%7B%22channelId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%2C%22subEntityId%22%3A%22task456%22%7D',
      );
    });
  });

  describe('navigateCrossDomain', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.meetingStage,
      FrameContexts.remove,
      FrameContexts.settings,
      FrameContexts.sidePanel,
      FrameContexts.stage,
      FrameContexts.task,
    ];

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('https://valid.origin.com')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with a bad origin', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('https://badorigin.com')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an empty origin', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with a blank origin', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain(' ')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an origin without base', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('blahblah')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an origin without suffix', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('https://blahblah')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an origin with invalid base', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('blah://valid.origin.com')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    Object.keys(FrameContexts).forEach(k => {
      const context = FrameContexts[k];
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should allow calls from ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);

          const promise = pages.navigateCrossDomain('https://valid.origin.com');
          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          utils.respondToMessage(navigateCrossDomainMessage, true);

          await expect(promise).resolves.not.toThrow();
        });
      } else {
        it(`should not allow calls from ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);

          await pages
            .navigateCrossDomain('https://valid.origin.com')
            .catch(e =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ["content","sidePanel","settings","remove","task","stage","meetingStage"]. Current context: "${context}".`,
                ),
              ),
            );
        });
      }
    });

    it('should successfully navigate cross-origin', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      pages.navigateCrossDomain('https://valid.origin.com');

      const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
    });

    it('should throw on invalid cross-origin navigation request', async () => {
      expect.assertions(4);
      await utils.initializeWithContext(FrameContexts.settings);

      const promise = pages.navigateCrossDomain('https://invalid.origin.com');

      const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

      utils.respondToMessage(navigateCrossDomainMessage, false);

      await promise.catch(e =>
        expect(e).toMatchObject(
          new Error(
            'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
          ),
        ),
      );
    });
  });

  describe('returnFocus', () => {
    it('should successfully returnFocus', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      pages.returnFocus(true);

      const returnFocusMessage = utils.findMessageByFunc('returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });
});
