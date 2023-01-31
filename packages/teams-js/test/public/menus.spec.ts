import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app, FrameContexts, menus } from '../../src/public';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize, setUnitializedRuntime } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('Testing menus capability', () => {
  describe('FRAMED - Testing menus capability', () => {
    const framedMock = new Utils();

    beforeEach(() => {
      framedMock.processMessage = null;
      framedMock.messages = [];
      framedMock.childMessages = [];
      framedMock.childWindow.closed = false;
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (app._uninitialize) {
        framedMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
    });

    describe('Testing menus.isSupported', () => {
      it('should throw if called before initialization', () => {
        setUnitializedRuntime();
        expect(() => menus.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    describe('Testing menus.setUpViews function', () => {
      const viewConfiguration: menus.ViewConfiguration = {
        id: 'some ID',
        title: 'some Title',
      };

      it('should not allow calls before initialization', () => {
        expect(() => menus.setUpViews([viewConfiguration], () => true)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`menus.setUpViews should throw error when menus is not supported  when set to true in ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            menus.setUpViews([viewConfiguration], () => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`menus.setUpViews should initiate the post message to Parent when set to true in ${frameContext} context `, async () => {
          await framedMock.initializeWithContext(frameContext);
          menus.setUpViews([viewConfiguration], () => true);
          const message = framedMock.findMessageByFunc('setUpViews');
          expect(message).not.toBeUndefined();
          expect(message.args[0]).toStrictEqual([viewConfiguration]);
        });
      });
    });

    describe('Testing menus.setNavBarMenu function', () => {
      const menuItem: menus.MenuItem = new menus.MenuItem();

      it('should not allow calls before initialization', () => {
        expect(() => menus.setNavBarMenu([menuItem], () => true)).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`menus.setNavBarMenu should throw error when menus is not supported  when set to true in ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            menus.setNavBarMenu([menuItem], () => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`menus.setNavBarMenu should initiate the post message to Parent when set to true in ${frameContext} context `, async () => {
          await framedMock.initializeWithContext(frameContext);
          menus.setNavBarMenu([menuItem], () => true);
          const message = framedMock.findMessageByFunc('setNavBarMenu');
          expect(message).not.toBeUndefined();
          expect(message.args[0]).toStrictEqual([menuItem]);
        });
      });
    });

    describe('Testing menus.showActionMenu function', () => {
      const actionMenuParams: menus.ActionMenuParameters = {
        title: 'Some Title',
        items: [new menus.MenuItem()],
      };

      it('should not allow calls before initialization', () => {
        expect(() => menus.showActionMenu(actionMenuParams, () => true)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`menus.showActionMenu should throw error when menus is not supported  when set to true in ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            menus.showActionMenu(actionMenuParams, () => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`menus.showActionMenu should initiate the post message to Parent when set to true in ${frameContext} context `, async () => {
          await framedMock.initializeWithContext(frameContext);
          menus.showActionMenu(actionMenuParams, () => true);
          const message = framedMock.findMessageByFunc('showActionMenu');
          expect(message).not.toBeUndefined();
          expect(message.args[0]).toStrictEqual(actionMenuParams);
        });
      });
    });
  });

  describe('FRAMELESS - Testing menus capability', () => {
    const framedMock = new Utils();
    const framelessMock = new FramelessPostMocks();

    beforeEach(() => {
      framedMock.processMessage = null;
      framedMock.messages = [];
      framelessMock.messages = [];
      framedMock.childMessages = [];
      framedMock.childWindow.closed = false;
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (app._uninitialize) {
        framedMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
    });

    describe('Testing menus.setUpViews function', () => {
      const viewConfiguration: menus.ViewConfiguration = {
        id: 'some ID',
        title: 'some Title',
      };

      it('should not allow calls before initialization', () => {
        expect(() => menus.setUpViews([viewConfiguration], () => true)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`menus.setUpViews should throw error when menus is not supported  when set to true in ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            menus.setUpViews([viewConfiguration], () => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`menus.setUpViews should initiate the post message to Parent when set to true in ${frameContext} context `, async () => {
          await framelessMock.initializeWithContext(frameContext);
          menus.setUpViews([viewConfiguration], () => true);
          const message = framelessMock.findMessageByFunc('setUpViews');
          expect(message).not.toBeUndefined();
          expect(message.args[0]).toStrictEqual([viewConfiguration]);
        });
      });
    });

    describe('Testing menus.setNavBarMenu function', () => {
      const menuItem: menus.MenuItem = new menus.MenuItem();
      const expectedOutput: {
        enabled: boolean;
        selected: boolean;
      } = { enabled: true, selected: false };

      it('should not allow calls before initialization', () => {
        expect(() => menus.setNavBarMenu([menuItem], () => true)).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`menus.setNavBarMenu should throw error when menus is not supported  when set to true in ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            menus.setNavBarMenu([menuItem], () => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`menus.setNavBarMenu should initiate the post message to Parent when set to true in ${frameContext} context `, async () => {
          await framelessMock.initializeWithContext(frameContext);
          menus.setNavBarMenu([menuItem], () => false);
          const message = framelessMock.findMessageByFunc('setNavBarMenu');
          expect(message).not.toBeUndefined();
          expect(message.args[0]).toStrictEqual([expectedOutput]);
        });
      });
    });

    describe('Testing menus.showActionMenu function', () => {
      const actionMenuParams: menus.ActionMenuParameters = {
        title: 'Some Title',
        items: [new menus.MenuItem()],
      };

      const expectedOutput: {
        title: string;
        items: {
          enabled: boolean;
          selected: boolean;
        }[];
      } = {
        title: 'Some Title',
        items: [{ enabled: true, selected: false }],
      };

      it('should not allow calls before initialization', () => {
        expect(() => menus.showActionMenu(actionMenuParams, () => true)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`menus.showActionMenu should throw error when menus is not supported  when set to true in ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            menus.showActionMenu(actionMenuParams, () => true);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`menus.showActionMenu should initiate the post message to Parent when set to true in ${frameContext} context `, async () => {
          await framelessMock.initializeWithContext(frameContext);
          menus.showActionMenu(actionMenuParams, () => true);
          const message = framelessMock.findMessageByFunc('showActionMenu');
          expect(message).not.toBeUndefined();
          expect(message.args[0]).toStrictEqual(expectedOutput);
        });
      });
    });
  });
});
