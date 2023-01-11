import { errorLibraryNotInitialized } from '../../src/internal/constants';
import * as utilFunc from '../../src/internal/utils';
import { app, FrameContexts, pages } from '../../src/public';
import { navigateBack, navigateCrossDomain, navigateToTab, returnFocus } from '../../src/public/navigation';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('MicrosoftTeams-Navigation', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;
  });
  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('Testing navigation.returnFocus function', () => {
    it('navigation.returnFocus should not allow calls before initialization', () => {
      expect(() => returnFocus(true)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      it(`navigation.returnFocus should successfully call pages.returnFocus when initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        const pagesReturnFocus = jest.spyOn(pages, 'returnFocus');
        returnFocus(true);
        expect(pagesReturnFocus).toHaveBeenCalled();
      });

      it(`navigation.returnFocus should successfully returnFocus when set to true and initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);

        returnFocus(true);

        const returnFocusMessage = utils.findMessageByFunc('returnFocus');
        expect(returnFocusMessage).not.toBeNull();
        expect(returnFocusMessage.args.length).toBe(1);
        expect(returnFocusMessage.args[0]).toBe(true);
      });

      it(`navigation.returnFocus should successfully returnFocus when set to false and initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);

        returnFocus(false);

        const returnFocusMessage = utils.findMessageByFunc('returnFocus');
        expect(returnFocusMessage).not.toBeNull();
        expect(returnFocusMessage.args.length).toBe(1);
        expect(returnFocusMessage.args[0]).toBe(false);
      });
    });
  });

  describe('Testing navigation.navigateToTab function', () => {
    it('navigation.navigateToTab should not allow calls before initialization', () => {
      expect(() => navigateToTab(null)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      it(`navigation.navigateToTab should successfully call pages.tabs.nagivateToTab when initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        const pagesNavigateToTabs = jest.spyOn(pages.tabs, 'navigateToTab');
        navigateToTab(null);
        expect(pagesNavigateToTabs).toHaveBeenCalled();
      });

      it(`navigation.navigateToTab should register the navigateToTab action when initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        navigateToTab(null);
        const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
        expect(navigateToTabMsg).not.toBeNull();
      });

      it(`navigation.navigateToTab should not navigate to tab action when set to false and initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        jest.spyOn(utilFunc, 'getGenericOnCompleteHandler').mockImplementation(() => {
          return (success: boolean, reason: string): void => {
            if (!success) {
              expect(reason).toBe('Invalid internalTabInstanceId and/or channelId were/was provided');
            }
          };
        });
        navigateToTab(null);

        const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
        expect(navigateToTabMsg).not.toBeNull();
        expect(navigateToTabMsg.args.length).toBe(1);
        expect(navigateToTabMsg.args[0]).toBe(null);

        utils.respondToMessage(navigateToTabMsg, false);
      });
    });
  });

  describe('Testing navigation.navigateCrossDomain function', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    ];

    it('navigation.navigateCrossDomain should not allow calls before initialization', () => {
      expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`navigation.navigateCrossDomain should successfully call pages.navigateCrossDomain when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const pagesNavigateCrossDomain = jest.spyOn(pages, 'navigateCrossDomain');
          navigateCrossDomain('https://valid.origin.com');
          expect(pagesNavigateCrossDomain).toHaveBeenCalled();
        });

        it(`navigation.navigateCrossDomain should allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          navigateCrossDomain('https://valid.origin.com');
        });

        it(`navigation.navigateCrossDomain should successfully navigate cross-origin when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          navigateCrossDomain('https://valid.origin.com');

          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          expect(navigateCrossDomainMessage).not.toBeNull();
          expect(navigateCrossDomainMessage.args.length).toBe(1);
          expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
        });

        it(`navigation.navigateCrossDomain should throw on invalid cross-origin navigation request when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          navigateCrossDomain('https://invalid.origin.com', (success, reason) => {
            expect(success).toBeFalsy();
            expect(reason).toBe(
              'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
            );
          });

          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          expect(navigateCrossDomainMessage).not.toBeNull();
          expect(navigateCrossDomainMessage.args.length).toBe(1);
          expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

          utils.respondToMessage(navigateCrossDomainMessage, false);
        });

        it(`navigation.navigateCrossDomain should call getGenericOnCompleteHandler when no callback is provided when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          jest.spyOn(utilFunc, 'getGenericOnCompleteHandler').mockImplementation(() => {
            return (success: boolean, reason: string): void => {
              if (!success) {
                expect(reason).toBe(
                  'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
                );
              }
            };
          });
          navigateCrossDomain('https://invalid.origin.com');

          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          expect(navigateCrossDomainMessage).not.toBeNull();
          expect(navigateCrossDomainMessage.args.length).toBe(1);
          expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

          utils.respondToMessage(navigateCrossDomainMessage, false);
        });
      } else {
        it(`navigation.navigateCrossDomain should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing navigate.navigateBack function', () => {
    it('navigation.navigateBack should not allow calls before initialization', () => {
      expect(() => navigateBack()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      it(`navigation.navigateBack should successfully call pages.backStack.navigateBack when initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        const pagesBackStackNavigateBack = jest.spyOn(pages.backStack, 'navigateBack');
        navigateBack();
        expect(pagesBackStackNavigateBack).toHaveBeenCalled();
      });
      it(`navigate.navigateBack should register the navigateBack action when initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        navigateBack();
        const navigateBackMessage = utils.findMessageByFunc('navigateBack');
        expect(navigateBackMessage).not.toBeNull();
      });

      it(`navigation.navigateBack should call getGenericOnCompleteHandler when no callback is provided when initialized with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        jest.spyOn(utilFunc, 'getGenericOnCompleteHandler').mockImplementation(() => {
          return (success: boolean, reason: string): void => {
            if (!success) {
              expect(reason).toBe('Back navigation is not supported in the current client or context.');
            }
          };
        });
        navigateBack();

        const navigateBackMessage = utils.findMessageByFunc('navigateBack');
        expect(navigateBackMessage).not.toBeNull();
        expect(navigateBackMessage.args.length).toBe(0);

        utils.respondToMessage(navigateBackMessage, false);
      });
    });
  });
});
