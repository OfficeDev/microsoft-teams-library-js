import { version } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { getGenericOnCompleteHandler } from '../../src/internal/utils';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { FrameInfo, ShareDeepLinkParameters, TabInstance, TabInstanceParameters } from '../../src/public/interfaces';
import { pages } from '../../src/public/pages';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

const emptyCallback = () => {};
describe('Testing pages module', () => {
  describe('Framed - Testing pages module', () => {
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
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

        app._uninitialize();
      }
    });

    describe('Testing pages.returnFocus function', () => {
      it('pages.returnFocus should not allow calls before initialization', () => {
        expect(() => pages.returnFocus()).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        it(`pages.returnFocus should throw errors when pages is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            pages.returnFocus();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`pages.returnFocus should successfully returnFocus when set to true and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          pages.returnFocus(true);

          const returnFocusMessage = utils.findMessageByFunc('returnFocus');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(true);
        });

        it(`pages.returnFocus should not successfully returnFocus when set to false and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          pages.returnFocus(false);

          const returnFocusMessage = utils.findMessageByFunc('returnFocus');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(false);
        });
      });
    });

    describe('Testing pages.registerFocusEnterHandler function', () => {
      it('pages.registerFocusEnterHandler should not allow calls before initialization', () => {
        expect(() => pages.registerFocusEnterHandler(emptyCallback)).toThrowError(
          'The library has not yet been initialized',
        );
      });

      Object.values(FrameContexts).forEach(context => {
        it(`pages.registerFocusEnterHandler should throw errors when pages is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect.assertions(1);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            pages.registerFocusEnterHandler(emptyCallback);
          } catch (e) {
            expect(e).toMatchObject(errorNotSupportedOnPlatform);
          }
        });
        it(`pages.registerFocusEnterHandler should successfully register a focus enter handler when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          pages.registerFocusEnterHandler(() => {
            return true;
          });
          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('focusEnter');
        });

        it(`pages.registerFocusEnterHandler should successfully invoke focus enter handler when set to true and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = false;
          pages.registerFocusEnterHandler(() => {
            handlerInvoked = true;
            return true;
          });

          utils.sendMessage('focusEnter');
          expect(handlerInvoked).toBe(true);
        });

        it(`pages.registerFocusEnterHandler should not invoke focus enter handler when set to false initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = true;
          pages.registerFocusEnterHandler(() => {
            handlerInvoked = false;
            return false;
          });

          utils.sendMessage('focusEnter');
          expect(handlerInvoked).toBe(false);
        });
      });
    });

    describe('Testing pages.setCurrentFrame function', () => {
      const allowedContexts = [FrameContexts.content];
      const frameContext: FrameInfo = {
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
      };

      it('pages.setCurrentFrame should not allow calls before initialization', () => {
        expect(() => pages.setCurrentFrame(frameContext)).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.setCurrentFrame should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect.assertions(1);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              pages.setCurrentFrame(frameContext);
            } catch (e) {
              expect(e).toMatchObject(errorNotSupportedOnPlatform);
            }
          });

          it(`pages.setCurrentFrame should successfully set frame context when initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            pages.setCurrentFrame(frameContext);
            const message = utils.findMessageByFunc('setFrameContext');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(frameContext);
          });
        } else {
          it(`pages.setCurrentFrame should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => pages.setCurrentFrame(frameContext)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.initializeWithFrameContext function', () => {
      const allowedContexts = [FrameContexts.content];
      const frameContext: FrameInfo = {
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
      };

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.initializeWithFrameContext should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect.assertions(1);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              pages.initializeWithFrameContext(frameContext);
            } catch (e) {
              expect(e).toMatchObject(errorNotSupportedOnPlatform);
            }
          });

          it('pages.initializeWithFrameContext should successfully initialize and set the frame context', async () => {
            await utils.initializeWithContext(context);
            pages.initializeWithFrameContext(frameContext);
            expect(utils.processMessage).toBeDefined();
            expect(utils.messages.length).toBe(2);

            const initMessage = utils.findMessageByFunc('initialize');
            expect(initMessage).not.toBeNull();
            expect(initMessage.id).toBe(0);
            expect(initMessage.func).toBe('initialize');
            expect(initMessage.args.length).toEqual(1);
            expect(initMessage.args[0]).toEqual(version);
            const message = utils.findMessageByFunc('setFrameContext');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(frameContext);
          });
        } else {
          it(`pages.initializeWithFrameContext should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => pages.initializeWithFrameContext(frameContext)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.getConfig function', () => {
      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.settings,
        FrameContexts.remove,
        FrameContexts.sidePanel,
      ];
      const expectedSettings: pages.InstanceConfig = {
        suggestedDisplayName: 'someSuggestedDisplayName',
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
        entityId: 'someEntityId',
      };

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.getConfig should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.getConfig()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.getConfig should successfully get settings when initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.getConfig();
            const message = utils.findMessageByFunc('settings.getSettings');
            expect(message).not.toBeNull();
            utils.respondToMessage(message, expectedSettings);
            return expect(promise).resolves.toBe(expectedSettings);
          });
        } else {
          it(`pages.getConfig should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => pages.getConfig()).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.navigateCrossDomain function', () => {
      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.remove,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      ];

      it('pages.navigateCrossDomain should not allow calls before initialization', async () => {
        await expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      // Commenting out these tests as url validation is not implemented
      /*
      it('should not allow calls with a bad origin', async () => {
        await expect(pages.navigateCrossDomain('https://badorigin.com')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });
  
      it('should not allow calls with an empty origin', async () => {
        await expect(pages.navigateCrossDomain('')).rejects.toThrowError('The library has not yet been initialized');
      });
  
      it('should not allow calls with a blank origin', async () => {
        await expect(pages.navigateCrossDomain(' ')).rejects.toThrowError('The library has not yet been initialized');
      });
  
      it('should not allow calls with an origin without base', async () => {
        await expect(pages.navigateCrossDomain('blahblah')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });
  
      it('should not allow calls with an origin without suffix', async () => {
        await expect(pages.navigateCrossDomain('https://blahblah')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });
  
      it('should not allow calls with an origin with invalid base', async () => {
        await expect(pages.navigateCrossDomain('blah://valid.origin.com')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });
      */

      Object.keys(FrameContexts).forEach(k => {
        const context = FrameContexts[k];
        if (allowedContexts.some(allowedContext => allowedContext === context)) {
          it(`pages.navigateCrossDomain should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.navigateCrossDomain should allow calls from ${context} context`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context);

            const promise = pages.navigateCrossDomain('https://valid.origin.com');
            const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
            utils.respondToMessage(navigateCrossDomainMessage, true);

            await expect(promise).resolves.not.toThrow();
          });
        } else {
          it(`pages.navigateCrossDomain should not allow calls from ${context} context`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context);

            await expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('pages.navigateCrossDomain should successfully navigate cross-origin', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        pages.navigateCrossDomain('https://valid.origin.com');

        const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
        expect(navigateCrossDomainMessage).not.toBeNull();
        expect(navigateCrossDomainMessage.args.length).toBe(1);
        expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
      });

      it('pages.navigateCrossDomain should throw on invalid cross-origin navigation request', async () => {
        await utils.initializeWithContext(FrameContexts.settings);

        const promise = pages.navigateCrossDomain('https://invalid.origin.com');

        const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
        expect(navigateCrossDomainMessage).not.toBeNull();
        expect(navigateCrossDomainMessage.args.length).toBe(1);
        expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

        utils.respondToMessage(navigateCrossDomainMessage, false);

        await expect(promise).rejects.toThrowError(
          'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
        );
      });
    });

    describe('Testing pages.navigateToApp function', () => {
      const navigateToAppParams: pages.NavigateToAppParams = {
        appId: 'fe4a8eba-2a31-4737-8e33-e5fae6fee194',
        pageId: 'tasklist123',
        webUrl: 'https://tasklist.example.com/123',
        channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
        subPageId: 'task456',
      };

      it('pages.navigateToApp should not allow calls before initialization', async () => {
        await expect(pages.navigateToApp(navigateToAppParams)).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      ];

      Object.keys(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContext => allowedContext === context)) {
          it(`pages.navigateToApp should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.navigateToApp(navigateToAppParams)).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.navigateToApp should allow calls from ${context} context`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

            const promise = pages.navigateToApp(navigateToAppParams);

            const navigateToAppMessage = utils.findMessageByFunc('pages.navigateToApp');
            utils.respondToMessage(navigateToAppMessage, true);

            await expect(promise).resolves.toBe(undefined);
          });

          it('pages.navigateToApp should successfully send the navigateToApp message', async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

            const promise = pages.navigateToApp(navigateToAppParams);

            const navigateToAppMessage = utils.findMessageByFunc('pages.navigateToApp');
            utils.respondToMessage(navigateToAppMessage, true);
            await promise;

            expect(navigateToAppMessage).not.toBeNull();
            expect(navigateToAppMessage.args[0]).toStrictEqual(navigateToAppParams);
          });

          it('pages.navigateToApp should successfully send an executeDeepLink message for legacy teams clients', async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 1,
              isLegacyTeams: true,
              supports: {
                pages: {},
              },
            });

            const promise = pages.navigateToApp(navigateToAppParams);

            const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
            utils.respondToMessage(executeDeepLinkMessage, true);
            await promise;

            expect(executeDeepLinkMessage).not.toBeNull();
            expect(executeDeepLinkMessage.args[0]).toBe(
              'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?webUrl=https%3A%2F%2Ftasklist.example.com%2F123&context=%7B%22channelId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%2C%22subEntityId%22%3A%22task456%22%7D',
            );
          });
        } else {
          it(`pages.navigateToApp should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            await expect(pages.navigateToApp(navigateToAppParams)).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.shareDeepLink function', () => {
      const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
      const deepLinkParameters: ShareDeepLinkParameters = {
        subPageId: 'someSubEntityId',
        subPageLabel: 'someSubEntityLabel',
        subPageWebUrl: 'someSubEntityWebUrl',
      };

      it('pages.shareDeepLink should not allow calls before initialization', () => {
        expect(() => pages.shareDeepLink(deepLinkParameters)).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.shareDeepLink should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect.assertions(1);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              pages.shareDeepLink(deepLinkParameters);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it('pages.shareDeepLink should successfully share a deep link in content context', async () => {
            await utils.initializeWithContext(context);

            pages.shareDeepLink({
              subPageId: 'someSubEntityId',
              subPageLabel: 'someSubEntityLabel',
              subPageWebUrl: 'someSubEntityWebUrl',
            });

            const message = utils.findMessageByFunc('shareDeepLink');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(3);
            expect(message.args[0]).toBe('someSubEntityId');
            expect(message.args[1]).toBe('someSubEntityLabel');
            expect(message.args[2]).toBe('someSubEntityWebUrl');
          });
        } else {
          it(`pages.shareDeepLink should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => pages.shareDeepLink(deepLinkParameters)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.registerFullScreenHandler function', () => {
      it('pages.registerFullScreenHandler should not allow calls before initialization', () => {
        expect(() => pages.registerFullScreenHandler(emptyCallback)).toThrowError(
          'The library has not yet been initialized',
        );
      });
      Object.values(FrameContexts).forEach(context => {
        it(`pages.registerFullScreenHandler should throw errors when pages is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            pages.registerFullScreenHandler(() => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });
        it(`pages.registerFullScreenHandler should successfully register a full screen handler when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          pages.registerFullScreenHandler(() => {
            return true;
          });
          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('fullScreenChange');
        });

        it(`pages.registerFullScreenHandler should successfully invoke full screen handler when set to true and  initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = false;
          pages.registerFullScreenHandler(() => {
            handlerInvoked = true;
            return true;
          });

          utils.sendMessage('fullScreenChange');
          expect(handlerInvoked).toBe(true);
        });

        it(`pages.registerFullScreenHandler should not invoke full screen handler when set to false initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = true;
          pages.registerFullScreenHandler(() => {
            handlerInvoked = false;
            return false;
          });

          utils.sendMessage('fullScreenChange');
          expect(handlerInvoked).toBe(false);
        });
      });
    });

    describe('Testing pages.isSupported function', () => {
      it('pages.isSupported should return false if the runtime says pages is not supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(pages.isSupported()).not.toBeTruthy();
      });

      it('pages.isSupported should return true if the runtime says pages is supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
        expect(pages.isSupported()).toBeTruthy();
      });
    });

    describe('Testing pages.tabs namespace', () => {
      describe('Testing pages.tabs.navigateToTab function', () => {
        const tabInstance: TabInstance = {
          tabName: 'MockTab',
          internalTabInstanceId: 'MockTabInstanceId',
          lastViewUnixEpochTime: null,
          entityId: 'MockEntityId',
          channelId: 'MockChannelId',
          channelName: 'MockChannelName',
          channelIsFavorite: true,
          teamId: 'MockTeamId',
          teamName: 'MockTeamName',
          teamIsFavorite: true,
          groupId: 'MockGroupID',
          url: 'http://some-valid-content-url.com',
          websiteUrl: 'http://some-valid-website-url.com',
        };
        it('pages.tabs.navigateToTab should not allow calls before initialization', async () => {
          await expect(() => pages.tabs.navigateToTab(null)).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.tabs.navigateToTab should throw error when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.tabs.navigateToTab(tabInstance)).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.navigateToTab should throw error when pages.tabs is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.tabs.navigateToTab(tabInstance)).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.navigateToTab should register the navigateToTab action when initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            pages.tabs.navigateToTab(tabInstance);
            const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
            expect(navigateToTabMsg).not.toBeNull();
            expect(navigateToTabMsg.args[0]).toBe(tabInstance);
          });

          it(`pages.tabs.navigateToTab should throw error when initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.navigateToTab(null);
            const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
            expect(navigateToTabMsg).not.toBeNull();
            utils.respondToMessage(navigateToTabMsg, false);
            await promise.catch(e =>
              expect(e).toMatchObject(new Error('Invalid internalTabInstanceId and/or channelId were/was provided')),
            );
          });

          it(`pages.tabs.navigateToTab should register the navigateToTab action when initialized with ${context} context - success case`, async () => {
            await utils.initializeWithContext(context);
            pages.tabs.navigateToTab(null);
            const onComplete = getGenericOnCompleteHandler();
            onComplete(true);
            const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
            expect(navigateToTabMsg).not.toBeNull();
            expect(navigateToTabMsg.args[0]).toBe(null);
          });
        });
      });

      describe('Testing pages.tabs.getTabInstances function', () => {
        const expectedTabInstanceParameters: TabInstanceParameters = {
          favoriteChannelsOnly: true,
          favoriteTeamsOnly: true,
        };
        it('pages.tabs.getTabInstances should not allow calls before initialization', async () => {
          await expect(() => pages.tabs.getTabInstances()).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.tabs.getTabInstances should throw error when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.tabs.getTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getTabInstances should throw error when pages.tabs is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.tabs.getTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getTabInstances should successfully getTabInstance when no parameters are passed and initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.getTabInstances();
            const message = utils.findMessageByFunc('getTabInstances');

            utils.respondToMessage(message, expectedTabInstanceParameters);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBe(expectedTabInstanceParameters);
          });

          it(`pages.tabs.getTabInstances should be undefined getTabInstance when parameters are passed and initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.getTabInstances(expectedTabInstanceParameters);
            const message = utils.findMessageByFunc('getTabInstances');

            utils.respondToMessage(message);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBeUndefined();
          });

          it(`pages.tabs.getTabInstances should be undefined when no parameters are passed and initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.getTabInstances();
            const message = utils.findMessageByFunc('getTabInstances');

            utils.respondToMessage(message);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBeUndefined();
          });
        });
      });

      describe('Testing pages.tabs.getMruTabInstances function', () => {
        const expectedTabInstanceParameters: TabInstanceParameters = {
          favoriteChannelsOnly: true,
          favoriteTeamsOnly: true,
        };

        it('pages.tabs.getMruTabInstances should not allow calls before initialization', async () => {
          await expect(() => pages.tabs.getMruTabInstances()).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.tabs.getMruTabInstances should throw error when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.tabs.getMruTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getMruTabInstances should throw error when pages.tabs is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.tabs.getMruTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getMruTabInstances should successfully getTabInstance when no parameters are passed and initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.getMruTabInstances();
            const message = utils.findMessageByFunc('getMruTabInstances');

            utils.respondToMessage(message, expectedTabInstanceParameters);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBe(expectedTabInstanceParameters);
          });

          it(`pages.tabs.getMruTabInstances should be undefined getTabInstance when parameters are passed and initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.getMruTabInstances(expectedTabInstanceParameters);
            const message = utils.findMessageByFunc('getMruTabInstances');

            utils.respondToMessage(message);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBeUndefined();
          });

          it(`pages.tabs.getMruTabInstances should be undefined when no parameters are passed and initialized with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const promise = pages.tabs.getMruTabInstances();
            const message = utils.findMessageByFunc('getMruTabInstances');

            utils.respondToMessage(message);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBeUndefined();
          });
        });
      });

      describe('Testing pages.tabs.isSupported function', () => {
        it('pages.tabs.isSupported should return false if the runtime says pages is not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(pages.tabs.isSupported()).toBeFalsy();
        });

        it('pages.tabs.isSupported should return false if the runtime says pages.tabs is not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
          expect(pages.tabs.isSupported()).not.toBeTruthy();
        });

        it('pages.tabs.isSupported should return true if the runtime says pages.tabs is supported', () => {
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { pages: { tabs: {} } },
          });
          expect(pages.tabs.isSupported()).toBeTruthy();
        });
      });
    });

    describe('Testing pages.config namespace', () => {
      describe('Testing pages.config.setValidityState function', () => {
        const allowedContexts = [FrameContexts.settings, FrameContexts.remove];

        it('pages.config.setValidityState should not allow calls before initialization', () => {
          expect(() => pages.config.setValidityState(true)).toThrowError('The library has not yet been initialized');
          expect(() => pages.config.setValidityState(false)).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.setValidityState should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.config.setValidityState(true);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.config.setValidityState(true);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should throw error when pages is not supported when initialized with ${context} when set to false`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.config.setValidityState(false);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should throw error when pages.tabs is not supported when initialized with ${context} when set to false`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.config.setValidityState(false);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should successfully set validity state to true when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              pages.config.setValidityState(true);

              const message = utils.findMessageByFunc('settings.setValidityState');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe(true);
            });

            it(`pages.config.setValidityState should successfully set validity state to false when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              pages.config.setValidityState(false);

              const message = utils.findMessageByFunc('settings.setValidityState');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe(false);
            });
          } else {
            it(`pages.config.setValidityState does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.config.setValidityState(true)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.setConfig function', () => {
        const allowedContexts = [FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel];

        const settingsObj: pages.InstanceConfig = {
          suggestedDisplayName: 'someSuggestedDisplayName',
          contentUrl: 'someContentUrl',
          websiteUrl: 'someWebsiteUrl',
          entityId: 'someEntityId',
        };

        it('pages.config.setConfig should not allow calls before initialization', () => {
          expect(() => pages.config.setConfig({} as pages.InstanceConfig)).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.setConfig should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect(pages.config.setConfig(settingsObj)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it(`pages.config.setConfig should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect(pages.config.setConfig(settingsObj)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it(`pages.config.setConfig should successfully set settings when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              pages.config.setConfig(settingsObj);
              const message = utils.findMessageByFunc('settings.setSettings');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe(settingsObj);
            });
          } else {
            it(`pages.config.setConfig does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(pages.config.setConfig(settingsObj)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.registerOnSaveHandler function', () => {
        const allowedContexts = [FrameContexts.settings];

        it('pages.config.registerOnSaveHandler should not allow calls before initialization', () => {
          expect(() => pages.config.registerOnSaveHandler(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.registerOnSaveHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.config.registerOnSaveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnSaveHandler should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.config.registerOnSaveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnSaveHandler should successfully register a save handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(() => {
                handlerCalled = true;
              });
              utils.sendMessage('settings.save');
              expect(handlerCalled).toBe(true);
            });

            it(`pages.config.registerOnSaveHandler should successfully add webhookUrl to save handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                handlerCalled = true;
                expect(saveEvent.result['webhookUrl']).not.toBeNull();
              });
              utils.sendMessage('settings.save', [
                {
                  webhookUrl: 'someWebhookUrl',
                },
              ]);

              expect(handlerCalled).toBe(true);
            });

            it(`pages.config.registerOnSaveHandler should successfully override a save handler with another when initialized with ${context}context`, async () => {
              await utils.initializeWithContext(context);
              let handler1Called = false;
              let handler2Called = false;
              pages.config.registerOnSaveHandler(() => {
                handler1Called = true;
              });
              pages.config.registerOnSaveHandler(() => {
                handler2Called = true;
              });

              utils.sendMessage('settings.save');

              expect(handler1Called).toBe(false);
              expect(handler2Called).toBe(true);
            });

            it(`pages.config.registerOnSaveHandler should successfully notify success from the registered save handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                saveEvent.notifySuccess();
                handlerCalled = true;
              });
              utils.sendMessage('settings.save');
              expect(handlerCalled).toBe(true);
              const message = utils.findMessageByFunc('settings.save.success');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(0);
            });

            it(`pages.config.registerOnSaveHandler should successfully notify failure from the registered save handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                saveEvent.notifyFailure('someReason');
                handlerCalled = true;
              });
              utils.sendMessage('settings.save');
              expect(handlerCalled).toBe(true);
              const message = utils.findMessageByFunc('settings.save.failure');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe('someReason');
            });

            it(`pages.config.registerOnSaveHandler should not allow multiple notifies from the registered save handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                saveEvent.notifySuccess();
                expect(() => saveEvent.notifySuccess()).toThrowError(
                  'The SaveEvent may only notify success or failure once.',
                );
                expect(() => saveEvent.notifyFailure()).toThrowError(
                  'The SaveEvent may only notify success or failure once.',
                );
                handlerCalled = true;
              });
              utils.sendMessage('settings.save');
              expect(handlerCalled).toBe(true);
              const message = utils.findMessageByFunc('settings.save.success');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(0);
            });
          } else {
            it(`pages.config.registerOnSaveHandler does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.config.registerOnSaveHandler(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.registerOnRemoveHandler function', () => {
        const allowedContexts = [FrameContexts.remove, FrameContexts.settings];

        it('pages.config.registerOnRemoveHandler should not allow calls before initialization', () => {
          expect(() => pages.config.registerOnRemoveHandler(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.registerOnRemoveHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.config.registerOnRemoveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnRemoveHandler should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.config.registerOnRemoveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnRemoveHandler should successfully register a remove handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);

              let handlerCalled = false;
              pages.config.registerOnRemoveHandler(() => {
                handlerCalled = true;
              });

              utils.sendMessage('settings.remove');

              expect(handlerCalled).toBeTruthy();
            });

            it(`pages.config.registerOnRemoveHandler should successfully notify success from the registered remove handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);

              let handlerCalled = false;
              pages.config.registerOnRemoveHandler(removeEvent => {
                removeEvent.notifySuccess();
                handlerCalled = true;
              });

              utils.sendMessage('settings.remove');

              expect(handlerCalled).toBe(true);
              const message = utils.findMessageByFunc('settings.remove.success');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(0);
            });

            it(`pages.config.registerOnRemoveHandler should successfully notify failure from the registered remove handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);

              let handlerCalled = false;
              pages.config.registerOnRemoveHandler(removeEvent => {
                removeEvent.notifyFailure('someReason');
                handlerCalled = true;
              });

              utils.sendMessage('settings.remove');

              expect(handlerCalled).toBe(true);
              const message = utils.findMessageByFunc('settings.remove.failure');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe('someReason');
            });
          } else {
            it(`pages.config.registerOnRemoveHandler does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.config.registerOnRemoveHandler(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.registerChangeConfigHandler function', () => {
        const allowedContexts = [FrameContexts.content];

        it('pages.config.registerChangeConfigHandler should not allow calls before initialization', () => {
          expect(() => pages.config.registerChangeConfigHandler(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.registerChangeConfigHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.config.registerChangeConfigHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerChangeConfigHandler should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.config.registerChangeConfigHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerChangeConfigHandler should successfully register a change settings handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;

              pages.config.registerChangeConfigHandler(() => {
                handlerCalled = true;
              });

              utils.sendMessage('changeSettings', '');
              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.config.registerChangeConfigHandler does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.config.registerChangeConfigHandler(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.isSupported function', () => {
        it('pages.config.isSupported should return false if the runtime says its not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(pages.config.isSupported()).not.toBeTruthy();
        });
        it('pages.config.isSupported should return false if the runtime says pages.config is not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
          expect(pages.config.isSupported()).not.toBeTruthy();
        });

        it('pages.config.isSupported should return true if the runtime says pages.config is supported', () => {
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { pages: { config: {} } },
          });
          expect(pages.config.isSupported()).toBeTruthy();
        });
      });
    });

    describe('Testing pages.backStack namespace', () => {
      describe('Testing pages.backStack._initialize function', () => {
        it('pages.backStack._initialize should successfully register backButtonPress handler', () => {
          pages.backStack._initialize();
          const message = utils.findMessageByFunc('backButtonPress');
          expect(message).toBeNull();
        });
      });

      describe('Testing pages.backStack.navigateBack function', () => {
        it('pages.backStack.navigateBack should not allow calls before initialization', async () => {
          await expect(pages.backStack.navigateBack()).rejects.toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.backStack.navigateBack should throw error when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.backStack.navigateBack()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.backStack.navigateBack should throw error when pages.backStack is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.backStack.navigateBack()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.backStack.navigateBack should register the navigateBack action when initialized with ${context} context`, () => {
            utils.initializeWithContext(context);
            pages.backStack.navigateBack();
            const navigateBackMessage = utils.findMessageByFunc('navigateBack');
            expect(navigateBackMessage).not.toBeNull();
          });
        });
      });

      describe('Testing pages.backStack.registerBackButtonHandler function', () => {
        it('pages.backStack.registerBackButtonHandler should not allow calls before initialization when set to true', () => {
          expect(() => pages.backStack.registerBackButtonHandler(() => true)).toThrowError(
            'The library has not yet been initialized',
          );
        });
        it('pages.backStack.registerBackButtonHandler should not allow calls before initialization when set to false', () => {
          expect(() => pages.backStack.registerBackButtonHandler(() => false)).toThrowError(
            'The library has not yet been initialized',
          );
        });
        Object.values(FrameContexts).forEach(context => {
          it(`pages.backStack.registerBackButtonHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(1);
            try {
              pages.backStack.registerBackButtonHandler(() => true);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`pages.backStack.registerBackButtonHandler should throw error when pages.backStack is not supported when initialized with ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect.assertions(1);
            try {
              pages.backStack.registerBackButtonHandler(() => true);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`pages.backStack.registerBackButtonHandler should throw error when pages is not supported when initialized with ${context} when set to false.`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(1);
            try {
              pages.backStack.registerBackButtonHandler(() => false);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`pages.backStack.registerBackButtonHandler should throw error when pages.backStack is not supported when initialized with ${context} when set to false.`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect.assertions(1);
            try {
              pages.backStack.registerBackButtonHandler(() => false);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it('pages.backStack.registerBackButtonHandler should successfully register a back button handler and not call navigateBack if it returns true', async () => {
            await utils.initializeWithContext(context);

            let handlerInvoked = false;
            pages.backStack.registerBackButtonHandler(() => {
              handlerInvoked = true;
              return true;
            });

            utils.sendMessage('backButtonPress');

            const navigateBackMessage = utils.findMessageByFunc('navigateBack');
            expect(navigateBackMessage).toBeNull();
            expect(handlerInvoked).toBe(true);
          });

          it('pages.backStack.registerBackButtonHandler should successfully register a back button handler and call navigateBack if it returns false', async () => {
            await utils.initializeWithContext(context);

            let handlerInvoked = false;
            pages.backStack.registerBackButtonHandler(() => {
              handlerInvoked = true;
              return false;
            });

            utils.sendMessage('backButtonPress');

            const navigateBackMessage = utils.findMessageByFunc('navigateBack');
            expect(navigateBackMessage).not.toBeNull();
            expect(handlerInvoked).toBe(true);
          });
        });
      });

      describe('Testing pages.backStack.isSupported function', () => {
        it('pages.backStack.isSupported should return false if the runtime says its not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(pages.backStack.isSupported()).not.toBeTruthy();
        });
        it('pages.backStack.isSupported should return false if the runtime says pages.backStack is not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
          expect(pages.backStack.isSupported()).not.toBeTruthy();
        });

        it('pages.backStack.isSupported should return true if the runtime says pages.backStack is supported', () => {
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { pages: { backStack: {} } },
          });
          expect(pages.backStack.isSupported()).toBeTruthy();
        });
      });
    });

    describe('Testing pages.fullTrust namespace', () => {
      const allowedContexts = [FrameContexts.content];
      describe('Testing pages.fullTrust.enterFullScreen function', () => {
        it('pages.fullTrust.enterFullScreen should not allow calls before initialization', () => {
          expect(() => pages.fullTrust.enterFullscreen()).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.fullTrust.enterFullScreen should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.fullTrust.enterFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.enterFullScreen should throw error when pages.fullTrust is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.fullTrust.enterFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.enterFullScreen should successfully enter fullscreen when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              pages.fullTrust.enterFullscreen();
              const enterFullscreenMessage = utils.findMessageByFunc('enterFullscreen');
              expect(enterFullscreenMessage).not.toBeNull();
            });
          } else {
            it(`pages.fullTrust.enterFullScreen does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.fullTrust.enterFullscreen()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.fullTrust.exitFullscreen function', () => {
        it('pages.fullTrust.exitFullscreen should not allow calls before initialization', () => {
          expect(() => pages.fullTrust.exitFullscreen()).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.fullTrust.exitFullscreen should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.fullTrust.exitFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.exitFullscreen should throw error when pages.fullTrust is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.fullTrust.exitFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.exitFullscreen should successfully exit fullscreen when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              pages.fullTrust.exitFullscreen();
              const enterFullscreenMessage = utils.findMessageByFunc('exitFullscreen');
              expect(enterFullscreenMessage).not.toBeNull();
            });
          } else {
            it(`pages.fullTrust.exitFullscreen does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.fullTrust.exitFullscreen()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.fullTrust.isSupported function', () => {
        it('pages.fullTrust.isSupported should return false if the runtime says its not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(pages.fullTrust.isSupported()).not.toBeTruthy();
        });
        it('pages.fullTrust.isSupported should return false if the runtime says pages.fullTrust is not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
          expect(pages.fullTrust.isSupported()).not.toBeTruthy();
        });

        it('pages.fullTrust.isSupported should return true if the runtime says pages.fullTrust is supported', () => {
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { pages: { fullTrust: {} } },
          });
          expect(pages.fullTrust.isSupported()).toBeTruthy();
        });
      });
    });

    describe('Testing pages.appButton namespace', () => {
      const allowedContexts = [FrameContexts.content];
      describe('Testing pages.appButton.onClick function', () => {
        it('pages.appButton.onClick should not allow calls before initialization', () => {
          expect(() => pages.appButton.onClick(emptyCallback)).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.appButton.onClick should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.appButton.onClick(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onClick should throw error when pages.appButton is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.appButton.onClick(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onClick should successfully register a app button click handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.appButton.onClick(() => {
                handlerCalled = true;
              });
              utils.sendMessage('appButtonClick', '');
              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.appButton.onClick does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.appButton.onClick(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.appButton.onHoverEnter function', () => {
        it('pages.appButton.onHoverEnter should not allow calls before initialization', () => {
          expect(() => pages.appButton.onHoverEnter(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.appButton.onHoverEnter should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.appButton.onHoverEnter(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverEnter should throw error when pages.appButton is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.appButton.onHoverEnter(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverEnter should successfully register a app button hover handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.appButton.onHoverEnter(() => {
                handlerCalled = true;
              });
              utils.sendMessage('appButtonHoverEnter', '');
              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.appButton.onHoverEnter does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.appButton.onHoverEnter(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.appButton.onHoverLeave function', () => {
        it('pages.appButton.onHoverLeave should not allow calls before initialization', () => {
          expect(() => pages.appButton.onHoverLeave(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.appButton.onHoverLeave should throw error when pages is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              try {
                pages.appButton.onHoverLeave(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverLeave should throw error when pages.appButton is not supported when initialized with ${context}`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(1);
              try {
                pages.appButton.onHoverLeave(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverLeave should successfully register a app button hover leave handler when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              let handlerCalled = false;
              pages.appButton.onHoverLeave(() => {
                handlerCalled = true;
              });
              utils.sendMessage('appButtonHoverLeave', '');
              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.appButton.onHoverLeave does not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              expect(() => pages.appButton.onHoverLeave(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.appButton.isSupported function', () => {
        it('pages.appButton.isSupported should return false if the runtime says its not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(pages.appButton.isSupported()).not.toBeTruthy();
        });
        it('pages.appButton.isSupported should return false if the runtime says pages.appButton is not supported', () => {
          utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
          expect(pages.appButton.isSupported()).not.toBeTruthy();
        });

        it('pages.appButton.isSupported should return true if the runtime says pages.appButton is supported', () => {
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { pages: { appButton: {} } },
          });
          expect(pages.appButton.isSupported()).toBeTruthy();
        });
      });
    });
  });

  describe('Frameless - Testing pages module in frameless framework', () => {
    // Use to send a mock message from the app.
    const framelessPostMocks = new FramelessPostMocks();
    const utils = new Utils();

    beforeEach(() => {
      framelessPostMocks.messages = [];
      app._initialize(framelessPostMocks.mockWindow);
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

        app._uninitialize();
      }
    });

    describe('Testing pages.returnFocus function', () => {
      it('pages.returnFocus should not allow calls before initialization', () => {
        expect(() => pages.returnFocus()).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        it(`pages.returnFocus should throw errors when pages is not supported when initialized with ${context}`, async () => {
          await framelessPostMocks.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            pages.returnFocus();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`pages.returnFocus should successfully returnFocus when set to true and initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);

          pages.returnFocus(true);

          const returnFocusMessage = framelessPostMocks.findMessageByFunc('returnFocus');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(true);
        });

        it(`pages.returnFocus should not successfully returnFocus when set to false and initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);

          pages.returnFocus(false);

          const returnFocusMessage = framelessPostMocks.findMessageByFunc('returnFocus');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(false);
        });
      });
    });

    describe('Testing pages.registerFocusEnterHandler function', () => {
      it('pages.registerFocusEnterHandler should not allow calls before initialization', () => {
        expect(() => pages.registerFocusEnterHandler(emptyCallback)).toThrowError(
          'The library has not yet been initialized',
        );
      });
      Object.values(FrameContexts).forEach(context => {
        it(`pages.registerFocusEnterHandler should throw errors when pages is not supported when initialized with ${context}`, async () => {
          await framelessPostMocks.initializeWithContext(context);
          expect.assertions(4);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            pages.registerFocusEnterHandler(emptyCallback);
          } catch (e) {
            expect(e).toMatchObject(errorNotSupportedOnPlatform);
          }
        });
        it(`pages.registerFocusEnterHandler should successfully register a focus enter handler when initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);
          pages.registerFocusEnterHandler((x: boolean) => {
            return true;
          });
          const messageForRegister = framelessPostMocks.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('focusEnter');
        });

        it(`pages.registerFocusEnterHandler should successfully invoke focus enter handler when set to true and  initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);

          let handlerInvoked = false;
          pages.registerFocusEnterHandler((x: boolean) => {
            handlerInvoked = true;
            return true;
          });
          framelessPostMocks.respondToMessage({
            data: {
              func: 'focusEnter',
              args: [true],
            },
          } as DOMMessageEvent);
          expect(handlerInvoked).toBeTruthy();
        });

        it(`pages.registerFocusEnterHandler should not invoke focus enter handler when set to false initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);

          let handlerInvoked = true;
          pages.registerFocusEnterHandler((x: boolean) => {
            handlerInvoked = false;
            return false;
          });

          framelessPostMocks.respondToMessage({
            data: {
              func: 'focusEnter',
              args: [true],
            },
          } as DOMMessageEvent);
          expect(handlerInvoked).toBeFalsy();
        });
      });
    });

    describe('Testing pages.setCurrentFrame function', () => {
      const allowedContexts = [FrameContexts.content];
      const frameContext: FrameInfo = {
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
      };

      it('pages.setCurrentFrame should not allow calls before initialization', () => {
        expect(() => pages.setCurrentFrame(frameContext)).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.setCurrentFrame should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect.assertions(4);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              pages.setCurrentFrame(frameContext);
            } catch (e) {
              expect(e).toMatchObject(errorNotSupportedOnPlatform);
            }
          });

          it(`pages.setCurrentFrame should successfully set frame context when initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            pages.setCurrentFrame(frameContext);
            const message = framelessPostMocks.findMessageByFunc('setFrameContext');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toStrictEqual(frameContext);
          });
        } else {
          it(`pages.setCurrentFrame should not allow calls from ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect(() => pages.setCurrentFrame(frameContext)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.initializeWithFrameContext function', () => {
      const allowedContexts = [FrameContexts.content];
      const frameContext: FrameInfo = {
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
      };

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.initializeWithFrameContext should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect.assertions(4);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              pages.initializeWithFrameContext(frameContext);
            } catch (e) {
              expect(e).toMatchObject(errorNotSupportedOnPlatform);
            }
          });

          it('pages.initializeWithFrameContext should successfully initialize and set the frame context', async () => {
            await framelessPostMocks.initializeWithContext(context);
            pages.initializeWithFrameContext(frameContext);
            expect(framelessPostMocks.messages.length).toBe(2);

            const initMessage = framelessPostMocks.findMessageByFunc('initialize');
            expect(initMessage).not.toBeNull();
            expect(initMessage.id).toBe(0);
            expect(initMessage.func).toBe('initialize');
            expect(initMessage.args.length).toEqual(1);
            expect(initMessage.args[0]).toEqual(version);
            const message = framelessPostMocks.findMessageByFunc('setFrameContext');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toStrictEqual(frameContext);
          });
        } else {
          it(`pages.initializeWithFrameContext should not allow calls from ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect(() => pages.initializeWithFrameContext(frameContext)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.getConfig function', () => {
      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.settings,
        FrameContexts.remove,
        FrameContexts.sidePanel,
      ];
      const expectedSettings: pages.InstanceConfig = {
        suggestedDisplayName: 'someSuggestedDisplayName',
        contentUrl: 'someContentUrl',
        websiteUrl: 'someWebsiteUrl',
        entityId: 'someEntityId',
      };

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.getConfig should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.getConfig()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.getConfig should successfully get settings when initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.getConfig();
            const message = framelessPostMocks.findMessageByFunc('settings.getSettings');
            framelessPostMocks.respondToMessage({
              data: {
                id: message.id,
                args: [expectedSettings],
              },
            } as DOMMessageEvent);

            await expect(promise).resolves.toEqual(expectedSettings);
          });
        } else {
          it(`pages.getConfig should not allow calls from ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect(() => pages.getConfig()).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.navigateCrossDomain function', () => {
      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.remove,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      ];

      it('pages.navigateCrossDomain should not allow calls before initialization', async () => {
        await expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      Object.keys(FrameContexts).forEach(k => {
        const context = FrameContexts[k];
        if (allowedContexts.some(allowedContext => allowedContext === context)) {
          it(`pages.navigateCrossDomain should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.navigateCrossDomain should allow calls from ${context} context`, async () => {
            expect.assertions(6);
            await framelessPostMocks.initializeWithContext(context);

            const promise = pages.navigateCrossDomain('https://valid.origin.com');
            const navigateCrossDomainMessage = framelessPostMocks.findMessageByFunc('navigateCrossDomain');
            expect(navigateCrossDomainMessage).not.toBeNull();
            framelessPostMocks.respondToMessage({
              data: {
                id: navigateCrossDomainMessage.id,
                args: ['https://valid.origin.com'],
              },
            } as DOMMessageEvent);

            await expect(promise).resolves.not.toThrow();
            await expect(promise).resolves.toBeUndefined();
          });
        } else {
          it(`pages.navigateCrossDomain should not allow calls from ${context} context`, async () => {
            expect.assertions(4);
            await framelessPostMocks.initializeWithContext(context);

            await expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('pages.navigateCrossDomain should successfully navigate cross-origin', async () => {
        await framelessPostMocks.initializeWithContext(FrameContexts.content);

        pages.navigateCrossDomain('https://valid.origin.com');

        const navigateCrossDomainMessage = framelessPostMocks.findMessageByFunc('navigateCrossDomain');
        expect(navigateCrossDomainMessage).not.toBeNull();
        expect(navigateCrossDomainMessage.args.length).toBe(1);
        expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
      });

      it('pages.navigateCrossDomain should throw on invalid cross-origin navigation request', async () => {
        await framelessPostMocks.initializeWithContext(FrameContexts.settings);

        const promise = pages.navigateCrossDomain('https://invalid.origin.com');

        const navigateCrossDomainMessage = framelessPostMocks.findMessageByFunc('navigateCrossDomain');
        expect(navigateCrossDomainMessage).not.toBeNull();
        expect(navigateCrossDomainMessage.args.length).toBe(1);
        expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

        expect(navigateCrossDomainMessage).not.toBeNull();
        framelessPostMocks.respondToMessage({
          data: {
            id: navigateCrossDomainMessage.id,
            args: [false],
          },
        } as DOMMessageEvent);

        await expect(promise).rejects.toThrowError(
          'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
        );
      });
    });

    describe('Testing pages.navigateToApp function', () => {
      const navigateToAppParams: pages.NavigateToAppParams = {
        appId: 'fe4a8eba-2a31-4737-8e33-e5fae6fee194',
        pageId: 'tasklist123',
        webUrl: 'https://tasklist.example.com/123',
        channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
        subPageId: 'task456',
      };

      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      ];

      it('pages.navigateToApp should not allow calls before initialization', async () => {
        await expect(pages.navigateToApp(navigateToAppParams)).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      Object.keys(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContext => allowedContext === context)) {
          it(`pages.navigateToApp should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.navigateToApp(navigateToAppParams)).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.navigateToApp should allow calls from ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

            const promise = pages.navigateToApp(navigateToAppParams);

            const navigateToAppMessage = framelessPostMocks.findMessageByFunc('pages.navigateToApp');
            framelessPostMocks.respondToMessage({
              data: { id: navigateToAppMessage.id, args: [true] },
            } as DOMMessageEvent);

            await expect(promise).resolves.toBe(undefined);
          });

          it('pages.navigateToApp should successfully send the navigateToApp message', async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            const promise = pages.navigateToApp(navigateToAppParams);

            const navigateToAppMessage = framelessPostMocks.findMessageByFunc('pages.navigateToApp');
            framelessPostMocks.respondToMessage({
              data: {
                id: navigateToAppMessage.id,
                args: [navigateToAppParams],
              },
            } as DOMMessageEvent);

            await promise;

            expect(navigateToAppMessage).not.toBeNull();
            expect(navigateToAppMessage.args[0]).toStrictEqual(navigateToAppParams);
          });

          it('pages.navigateToApp should successfully send an executeDeepLink message for legacy teams clients', async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.navigateToApp(navigateToAppParams);

            const executeDeepLinkMessage = framelessPostMocks.findMessageByFunc('executeDeepLink');
            framelessPostMocks.respondToMessage({
              data: { id: executeDeepLinkMessage.id, args: [true] },
            } as DOMMessageEvent);
            await promise;

            expect(executeDeepLinkMessage).not.toBeNull();
            expect(executeDeepLinkMessage.args[0]).toBe(
              'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?webUrl=https%3A%2F%2Ftasklist.example.com%2F123&context=%7B%22channelId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%2C%22subEntityId%22%3A%22task456%22%7D',
            );
          });
        } else {
          it(`pages.navigateToApp should not allow calls from ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);

            await expect(pages.navigateToApp(navigateToAppParams)).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.shareDeepLink function', () => {
      const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
      const deepLinkParameters: ShareDeepLinkParameters = {
        subPageId: 'someSubEntityId',
        subPageLabel: 'someSubEntityLabel',
        subPageWebUrl: 'someSubEntityWebUrl',
      };

      it('pages.shareDeepLink should not allow calls before initialization', () => {
        expect(() => pages.shareDeepLink(deepLinkParameters)).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`pages.shareDeepLink should throw errors when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect.assertions(4);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              pages.shareDeepLink(deepLinkParameters);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it('pages.shareDeepLink should successfully share a deep link in content context', async () => {
            await framelessPostMocks.initializeWithContext(context);

            pages.shareDeepLink({
              subPageId: 'someSubEntityId',
              subPageLabel: 'someSubEntityLabel',
              subPageWebUrl: 'someSubEntityWebUrl',
            });

            const message = framelessPostMocks.findMessageByFunc('shareDeepLink');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(3);
            expect(message.args[0]).toBe('someSubEntityId');
            expect(message.args[1]).toBe('someSubEntityLabel');
            expect(message.args[2]).toBe('someSubEntityWebUrl');
          });
        } else {
          it(`pages.shareDeepLink should not allow calls from ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            expect(() => pages.shareDeepLink(deepLinkParameters)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing pages.registerFullScreenHandler function', () => {
      it('pages.registerFullScreenHandler should not allow calls before initialization', () => {
        expect(() => pages.registerFullScreenHandler(emptyCallback)).toThrowError(
          'The library has not yet been initialized',
        );
      });
      Object.values(FrameContexts).forEach(context => {
        it(`pages.registerFullScreenHandler should throw errors when pages is not supported when initialized with ${context}`, async () => {
          await framelessPostMocks.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            pages.registerFullScreenHandler(() => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });
        it(`pages.registerFullScreenHandler should successfully register a full screen handler when initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);
          pages.registerFullScreenHandler(() => true);
          const messageForRegister = framelessPostMocks.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('fullScreenChange');
        });

        it(`pages.registerFullScreenHandler should successfully invoke full screen handler when set to true and  initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);

          let handlerInvoked = false;
          pages.registerFullScreenHandler((x: boolean) => {
            handlerInvoked = true;
            return true;
          });

          framelessPostMocks.respondToMessage({
            data: { func: 'fullScreenChange', args: [undefined] },
          } as DOMMessageEvent);
          expect(handlerInvoked).toBe(true);
        });

        it(`pages.registerFullScreenHandler should not invoke full screen handler when set to false initialized with ${context} context`, async () => {
          await framelessPostMocks.initializeWithContext(context);

          let handlerInvoked = true;
          pages.registerFullScreenHandler((x: boolean) => {
            handlerInvoked = false;
            return false;
          });

          framelessPostMocks.respondToMessage({
            data: { func: 'fullScreenChange', args: [undefined] },
          } as DOMMessageEvent);
          expect(handlerInvoked).toBe(false);
        });
      });
    });

    describe('Testing pages.tabs namespace', () => {
      describe('Testing pages.tabs.navigateToTab function', () => {
        const tabInstance: TabInstance = {
          tabName: 'MockTab',
          internalTabInstanceId: 'MockTabInstanceId',
          lastViewUnixEpochTime: null,
          entityId: 'MockEntityId',
          channelId: 'MockChannelId',
          channelName: 'MockChannelName',
          channelIsFavorite: true,
          teamId: 'MockTeamId',
          teamName: 'MockTeamName',
          teamIsFavorite: true,
          groupId: 'MockGroupID',
          url: 'http://some-valid-content-url.com',
          websiteUrl: 'http://some-valid-website-url.com',
        };

        it('pages.tabs.navigateToTab should not allow calls before initialization', async () => {
          await expect(() => pages.tabs.navigateToTab(null)).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.tabs.navigateToTab should throw error when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.tabs.navigateToTab(tabInstance)).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.navigateToTab should throw error when pages.tabs is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.tabs.navigateToTab(tabInstance)).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.navigateToTab should register the navigateToTab action when initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            pages.tabs.navigateToTab(tabInstance);
            const navigateToTabMsg = framelessPostMocks.findMessageByFunc('navigateToTab');
            expect(navigateToTabMsg).not.toBeNull();
            expect(navigateToTabMsg.args[0]).toStrictEqual(tabInstance);
          });
          it(`pages.tabs.navigateToTab should register the navigateToTab action when initialized with ${context} context - success case`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            pages.tabs.navigateToTab(null);
            const onComplete = getGenericOnCompleteHandler();
            onComplete(true);
            const navigateToTabMsg = framelessPostMocks.findMessageByFunc('navigateToTab');
            expect(navigateToTabMsg).not.toBeNull();
            expect(navigateToTabMsg.args[0]).toBe(null);
          });
        });
      });

      describe('Testing pages.tabs.getTabInstances function', () => {
        const expectedTabInstanceParameters: TabInstanceParameters = {
          favoriteChannelsOnly: true,
          favoriteTeamsOnly: true,
        };
        it('pages.tabs.getTabInstances should not allow calls before initialization', async () => {
          await expect(() => pages.tabs.getTabInstances()).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.tabs.getTabInstances should throw error when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.tabs.getTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getTabInstances should throw error when pages.tabs is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.tabs.getTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getTabInstances should successfully getTabInstance when no parameters are passed and initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.tabs.getTabInstances();
            const message = framelessPostMocks.findMessageByFunc('getTabInstances');

            framelessPostMocks.respondToMessage({
              data: { id: message.id, args: [expectedTabInstanceParameters] },
            } as DOMMessageEvent);
            expect(message).not.toBeNull();
            await expect(promise).resolves.toBe(expectedTabInstanceParameters);
          });

          it(`pages.tabs.getTabInstances should be undefined getTabInstance when parameters are passed and  initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.tabs.getTabInstances(expectedTabInstanceParameters);
            const message = framelessPostMocks.findMessageByFunc('getTabInstances');

            framelessPostMocks.respondToMessage({
              data: { id: message.id, args: [expectedTabInstanceParameters] },
            } as DOMMessageEvent);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBe(expectedTabInstanceParameters);
          });

          it(`pages.tabs.getTabInstances should be undefined when no parameters are passed and initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.tabs.getTabInstances();
            const message = framelessPostMocks.findMessageByFunc('getTabInstances');

            framelessPostMocks.respondToMessage({
              data: { id: message.id, args: [undefined] },
            } as DOMMessageEvent);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBeUndefined();
          });
        });
      });

      describe('Testing pages.tabs.getMruTabInstances function', () => {
        const expectedTabInstanceParameters: TabInstanceParameters = {
          favoriteChannelsOnly: true,
          favoriteTeamsOnly: true,
        };

        it('pages.tabs.getMruTabInstances should not allow calls before initialization', async () => {
          await expect(() => pages.tabs.getMruTabInstances()).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.tabs.getMruTabInstances should throw error when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.tabs.getMruTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getMruTabInstances should throw error when pages.tabs is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.tabs.getMruTabInstances()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.tabs.getMruTabInstances should successfully getTabInstance when no parameters are passed and initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.tabs.getMruTabInstances();
            const message = framelessPostMocks.findMessageByFunc('getMruTabInstances');
            framelessPostMocks.respondToMessage({
              data: { id: message.id, args: [expectedTabInstanceParameters] },
            } as DOMMessageEvent);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBe(expectedTabInstanceParameters);
          });

          it(`pages.tabs.getMruTabInstances should be undefined getTabInstance when parameters are passed and  initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.tabs.getMruTabInstances(expectedTabInstanceParameters);
            const message = framelessPostMocks.findMessageByFunc('getMruTabInstances');

            framelessPostMocks.respondToMessage({
              data: { id: message.id, args: [expectedTabInstanceParameters] },
            } as DOMMessageEvent);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBe(expectedTabInstanceParameters);
          });

          it(`pages.tabs.getMruTabInstances should be undefined when no parameters are passed and initialized with ${context} context`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            const promise = pages.tabs.getMruTabInstances();
            const message = framelessPostMocks.findMessageByFunc('getMruTabInstances');

            framelessPostMocks.respondToMessage({
              data: { id: message.id, args: [undefined] },
            } as DOMMessageEvent);
            expect(message).not.toBeNull();
            expect(promise).resolves.toBeUndefined();
          });
        });
      });
    });

    describe('Testing pages.config namespace', () => {
      describe('Testing pages.config.initialize function', () => {
        it('pages.config.initialize should successfully register settings.save and settings.remove handler', async () => {
          pages.config.initialize();
          const messageForSettingeSaveHandler = framelessPostMocks.findMessageByFunc('settings.save');
          const messageForSettingeRemoveHandler = framelessPostMocks.findMessageByFunc('settings.remove');
          expect(messageForSettingeSaveHandler).toBeNull();
          expect(messageForSettingeRemoveHandler).toBeNull();
        });
      });

      describe('Testing pages.config.setValidityState function', () => {
        const allowedContexts = [FrameContexts.settings, FrameContexts.remove];

        it('pages.config.setValidityState should not allow calls before initialization', () => {
          expect(() => pages.config.setValidityState(true)).toThrowError('The library has not yet been initialized');
          expect(() => pages.config.setValidityState(false)).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.setValidityState should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.config.setValidityState(true);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.config.setValidityState(true);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should throw error when pages is not supported when initialized with ${context} when set to false`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.config.setValidityState(false);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should throw error when pages.tabs is not supported when initialized with ${context} when set to false`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.config.setValidityState(false);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.setValidityState should successfully set validity state to true when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              pages.config.setValidityState(true);

              const message = framelessPostMocks.findMessageByFunc('settings.setValidityState');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe(true);
            });

            it(`pages.config.setValidityState should successfully set validity state to false when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              pages.config.setValidityState(false);

              const message = framelessPostMocks.findMessageByFunc('settings.setValidityState');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe(false);
            });
          } else {
            it(`pages.config.setValidityState does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.config.setValidityState(true)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.setConfig function', () => {
        const allowedContexts = [FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel];

        const settingsObj: pages.InstanceConfig = {
          suggestedDisplayName: 'someSuggestedDisplayName',
          contentUrl: 'someContentUrl',
          websiteUrl: 'someWebsiteUrl',
          entityId: 'someEntityId',
        };

        it('pages.config.setConfig should not allow calls before initialization', () => {
          expect(() => pages.config.setConfig({} as pages.InstanceConfig)).rejects.toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.setConfig should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect(pages.config.setConfig(settingsObj)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it(`pages.config.setConfig should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect(pages.config.setConfig(settingsObj)).rejects.toEqual(errorNotSupportedOnPlatform);
            });
            it(`pages.config.setConfig should successfully set settings when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              pages.config.setConfig(settingsObj);
              const message = framelessPostMocks.findMessageByFunc('settings.setSettings');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toStrictEqual(settingsObj);
            });
          } else {
            it(`pages.config.setConfig does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              await expect(pages.config.setConfig(settingsObj)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.registerOnSaveHandler function', () => {
        const allowedContexts = [FrameContexts.settings];

        it('pages.config.registerOnSaveHandler should not allow calls before initialization', () => {
          expect(() => pages.config.registerOnSaveHandler(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.registerOnSaveHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.config.registerOnSaveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnSaveHandler should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.config.registerOnSaveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnSaveHandler should successfully register a save handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(() => {
                handlerCalled = true;
              });
              framelessPostMocks.respondToMessage({
                data: { func: 'settings.save', args: [undefined] },
              } as DOMMessageEvent);
              expect(handlerCalled).toBe(true);
            });

            it(`pages.config.registerOnSaveHandler should successfully add webhookUrl to save handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                handlerCalled = true;
                expect(saveEvent.result['webhookUrl']).not.toBeNull();
              });
              framelessPostMocks.respondToMessage({
                data: {
                  func: 'settings.save',
                  args: [{ webhookUrl: 'someWebhookUrl' }],
                },
              } as DOMMessageEvent);

              expect(handlerCalled).toBe(true);
            });

            it(`pages.config.registerOnSaveHandler should successfully override a save handler with another when initialized with ${context}context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handler1Called = false;
              let handler2Called = false;
              pages.config.registerOnSaveHandler(() => {
                handler1Called = true;
              });
              pages.config.registerOnSaveHandler(() => {
                handler2Called = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'settings.save', args: [undefined] },
              } as DOMMessageEvent);

              expect(handler1Called).toBe(false);
              expect(handler2Called).toBe(true);
            });

            it(`pages.config.registerOnSaveHandler should successfully notify success from the registered save handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                saveEvent.notifySuccess();
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'settings.save', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBe(true);
              const message = framelessPostMocks.findMessageByFunc('settings.save.success');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(0);
            });

            it(`pages.config.registerOnSaveHandler should successfully notify failure from the registered save handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                saveEvent.notifyFailure('someReason');
                handlerCalled = true;
              });
              framelessPostMocks.respondToMessage({
                data: { func: 'settings.save', args: ['someReason'] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBe(true);
              const message = framelessPostMocks.findMessageByFunc('settings.save.failure');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe('someReason');
            });

            it(`pages.config.registerOnSaveHandler should not allow multiple notifies from the registered save handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.config.registerOnSaveHandler(saveEvent => {
                saveEvent.notifySuccess();
                expect(() => saveEvent.notifySuccess()).toThrowError(
                  'The SaveEvent may only notify success or failure once.',
                );
                expect(() => saveEvent.notifyFailure()).toThrowError(
                  'The SaveEvent may only notify success or failure once.',
                );
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'settings.save', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBe(true);
              const message = framelessPostMocks.findMessageByFunc('settings.save.success');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(0);
            });
          } else {
            it(`pages.config.registerOnSaveHandler does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.config.registerOnSaveHandler(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.registerOnRemoveHandler function', () => {
        const allowedContexts = [FrameContexts.remove, FrameContexts.settings];

        it('pages.config.registerOnRemoveHandler should not allow calls before initialization', () => {
          expect(() => pages.config.registerOnRemoveHandler(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.registerOnRemoveHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.config.registerOnRemoveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnRemoveHandler should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.config.registerOnRemoveHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerOnRemoveHandler should successfully register a remove handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);

              let handlerCalled = false;
              pages.config.registerOnRemoveHandler(() => {
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'settings.remove', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBeTruthy();
            });

            it(`pages.config.registerOnRemoveHandler should successfully notify success from the registered remove handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);

              let handlerCalled = false;
              pages.config.registerOnRemoveHandler(removeEvent => {
                removeEvent.notifySuccess();
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'settings.remove', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBe(true);
              const message = framelessPostMocks.findMessageByFunc('settings.remove.success');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(0);
            });

            it(`pages.config.registerOnRemoveHandler should successfully notify failure from the registered remove handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);

              let handlerCalled = false;
              pages.config.registerOnRemoveHandler(removeEvent => {
                removeEvent.notifyFailure('someReason');
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'settings.remove', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBe(true);
              const message = framelessPostMocks.findMessageByFunc('settings.remove.failure');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toBe('someReason');
            });
          } else {
            it(`pages.config.registerOnRemoveHandler does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.config.registerOnRemoveHandler(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.config.registerChangeConfigHandler function', () => {
        const allowedContexts = [FrameContexts.content];

        it('pages.config.registerChangeConfigHandler should not allow calls before initialization', () => {
          expect(() => pages.config.registerChangeConfigHandler(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.config.registerChangeConfigHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.config.registerChangeConfigHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerChangeConfigHandler should throw error when pages.config is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.config.registerChangeConfigHandler(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.config.registerChangeConfigHandler should successfully register a change settings handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;

              pages.config.registerChangeConfigHandler(() => {
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'changeSettings', args: [undefined] },
              } as DOMMessageEvent);
              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.config.registerChangeConfigHandler does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.config.registerChangeConfigHandler(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });

    describe('Testing pages.backStack namespace', () => {
      describe('Testing pages.backStack._initialize function', () => {
        it('pages.backStack._initialize should successfully register backButtonPress handler', () => {
          pages.backStack._initialize();
          const message = framelessPostMocks.findMessageByFunc('backButtonPress');
          expect(message).toBeNull();
        });
      });

      describe('Testing pages.backStack.navigateBack function', () => {
        it('pages.backStack.navigateBack should not allow calls before initialization', async () => {
          await expect(pages.backStack.navigateBack()).rejects.toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.backStack.navigateBack should throw error when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(pages.backStack.navigateBack()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`pages.backStack.navigateBack should throw error when pages.backStack is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect(pages.backStack.navigateBack()).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`pages.backStack.navigateBack should register the navigateBack action when initialized with ${context} context`, () => {
            framelessPostMocks.initializeWithContext(context);
            pages.backStack.navigateBack();
            const navigateBackMessage = framelessPostMocks.findMessageByFunc('navigateBack');
            expect(navigateBackMessage).not.toBeNull();
          });
        });
      });

      describe('Testing pages.backStack.registerBackButtonHandler function', () => {
        it('pages.backStack.registerBackButtonHandler should not allow calls before initialization when set to true', () => {
          expect(() => pages.backStack.registerBackButtonHandler(() => true)).toThrowError(
            'The library has not yet been initialized',
          );
        });
        it('pages.backStack.registerBackButtonHandler should not allow calls before initialization when set to false', () => {
          expect(() => pages.backStack.registerBackButtonHandler(() => false)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          it(`pages.backStack.registerBackButtonHandler should throw error when pages is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);
            try {
              pages.backStack.registerBackButtonHandler(() => true);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`pages.backStack.registerBackButtonHandler should throw error when pages.backStack is not supported when initialized with ${context}`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect.assertions(4);
            try {
              pages.backStack.registerBackButtonHandler(() => true);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`pages.backStack.registerBackButtonHandler should throw error when pages is not supported when initialized with ${context} when set to false.`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);
            try {
              pages.backStack.registerBackButtonHandler(() => false);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`pages.backStack.registerBackButtonHandler should throw error when pages.backStack is not supported when initialized with ${context} when set to false.`, async () => {
            await framelessPostMocks.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
            expect.assertions(4);
            try {
              pages.backStack.registerBackButtonHandler(() => false);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it('pages.backStack.registerBackButtonHandler should successfully register a back button handler and not call navigateBack if it returns true', async () => {
            await framelessPostMocks.initializeWithContext(context);

            let handlerInvoked = false;
            pages.backStack.registerBackButtonHandler(() => {
              handlerInvoked = true;
              return true;
            });

            framelessPostMocks.respondToMessage({
              data: { func: 'backButtonPress', args: [undefined] },
            } as DOMMessageEvent);

            const navigateBackMessage = framelessPostMocks.findMessageByFunc('navigateBack');
            expect(navigateBackMessage).toBeNull();
            expect(handlerInvoked).toBe(true);
          });

          it('pages.backStack.registerBackButtonHandler should successfully register a back button handler and call navigateBack if it returns false', async () => {
            await framelessPostMocks.initializeWithContext(context);

            let handlerInvoked = false;
            pages.backStack.registerBackButtonHandler(() => {
              handlerInvoked = true;
              return false;
            });

            framelessPostMocks.respondToMessage({
              data: { func: 'backButtonPress', args: [undefined] },
            } as DOMMessageEvent);

            const navigateBackMessage = framelessPostMocks.findMessageByFunc('navigateBack');
            expect(navigateBackMessage).not.toBeNull();
            expect(handlerInvoked).toBe(true);
          });
        });
      });
    });

    describe('Testing pages.fullTrust namespace', () => {
      const allowedContexts = [FrameContexts.content];
      describe('Testing pages.fullTrust.enterFullScreen function', () => {
        it('pages.fullTrust.enterFullScreen should not allow calls before initialization', () => {
          expect(() => pages.fullTrust.enterFullscreen()).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.fullTrust.enterFullScreen should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.fullTrust.enterFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.enterFullScreen should throw error when pages.fullTrust is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.fullTrust.enterFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.enterFullScreen should successfully enter fullscreen when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              pages.fullTrust.enterFullscreen();
              const enterFullscreenMessage = framelessPostMocks.findMessageByFunc('enterFullscreen');
              expect(enterFullscreenMessage).not.toBeNull();
            });
          } else {
            it(`pages.fullTrust.enterFullScreen does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.fullTrust.enterFullscreen()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.fullTrust.exitFullscreen function', () => {
        it('pages.fullTrust.exitFullscreen should not allow calls before initialization', () => {
          expect(() => pages.fullTrust.exitFullscreen()).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.fullTrust.exitFullscreen should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.fullTrust.exitFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.exitFullscreen should throw error when pages.fullTrust is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.fullTrust.exitFullscreen();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.fullTrust.exitFullscreen should successfully exit fullscreen when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              pages.fullTrust.exitFullscreen();
              const enterFullscreenMessage = framelessPostMocks.findMessageByFunc('exitFullscreen');
              expect(enterFullscreenMessage).not.toBeNull();
            });
          } else {
            it(`pages.fullTrust.exitFullscreen does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.fullTrust.exitFullscreen()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });

    describe('Testing pages.appButton namespace', () => {
      const allowedContexts = [FrameContexts.content];
      describe('Testing pages.appButton.onClick function', () => {
        it('pages.appButton.onClick should not allow calls before initialization', () => {
          expect(() => pages.appButton.onClick(emptyCallback)).toThrowError('The library has not yet been initialized');
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.appButton.onClick should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.appButton.onClick(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onClick should throw error when pages.appButton is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.appButton.onClick(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onClick should successfully register a app button click handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.appButton.onClick(() => {
                handlerCalled = true;
              });
              framelessPostMocks.respondToMessage({
                data: { func: 'appButtonClick', args: [undefined] },
              } as DOMMessageEvent);
              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.appButton.onClick does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.appButton.onClick(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.appButton.onHoverEnter function', () => {
        it('pages.appButton.onHoverEnter should not allow calls before initialization', () => {
          expect(() => pages.appButton.onHoverEnter(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.appButton.onHoverEnter should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.appButton.onHoverEnter(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverEnter should throw error when pages.appButton is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.appButton.onHoverEnter(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverEnter should successfully register a app button hover handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.appButton.onHoverEnter(() => {
                handlerCalled = true;
              });

              framelessPostMocks.respondToMessage({
                data: { func: 'appButtonHoverEnter', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.appButton.onHoverEnter does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.appButton.onHoverEnter(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing pages.appButton.onHoverLeave function', () => {
        it('pages.appButton.onHoverLeave should not allow calls before initialization', () => {
          expect(() => pages.appButton.onHoverLeave(emptyCallback)).toThrowError(
            'The library has not yet been initialized',
          );
        });

        Object.values(FrameContexts).forEach(context => {
          if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
            it(`pages.appButton.onHoverLeave should throw error when pages is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(4);
              try {
                pages.appButton.onHoverLeave(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverLeave should throw error when pages.appButton is not supported when initialized with ${context}`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });
              expect.assertions(4);
              try {
                pages.appButton.onHoverLeave(emptyCallback);
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });

            it(`pages.appButton.onHoverLeave should successfully register a app button hover leave handler when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              let handlerCalled = false;
              pages.appButton.onHoverLeave(() => {
                handlerCalled = true;
              });
              framelessPostMocks.respondToMessage({
                data: { func: 'appButtonHoverLeave', args: [undefined] },
              } as DOMMessageEvent);

              expect(handlerCalled).toBeTruthy();
            });
          } else {
            it(`pages.appButton.onHoverLeave does not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              expect(() => pages.appButton.onHoverLeave(emptyCallback)).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });
  });
});
