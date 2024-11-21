import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { store } from '../../src/private';
import { app, AppId } from '../../src/public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize, latestRuntimeApiVersion } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('store', () => {
  let utils: Utils = new Utils();
  beforeEach(() => {
    utils = new Utils();
    utils.messages = [];
  });
  afterEach(() => {
    app._uninitialize();
  });

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => store.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('openStoreExperience', () => {
    const paramFullStore: store.OpenFullStoreAndICSParams = {
      dialogType: store.StoreDialogType.FullStore,
    };
    const paramAppDetail: store.OpenAppDetailParams = {
      dialogType: store.StoreDialogType.AppDetail,
      appId: new AppId('1542629c-01b3-4a6d-8f76-1938b779e48d'),
    };
    const argsAppDetail = ['appdetail', '1542629c-01b3-4a6d-8f76-1938b779e48d'];
    const paramInvalidStoreType = {
      dialogType: '123',
    };
    const paramStoreNoId = {
      dialogType: store.StoreDialogType.SpecificStore,
    };
    const paramAppDetailNoId = {
      dialogType: store.StoreDialogType.AppDetail,
    };

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];

    it('store.openStoreExperience should not allow calls before initialization', async () => {
      await expect(() => store.openStoreExperience(paramFullStore)).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when dialog is not supported in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: {} });
          store.openStoreExperience(paramFullStore).catch((e) => {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          });
        });

        it(`should pass along entire openStoreExperience parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openStoreExperience(paramAppDetail).then(() => {
            const openMessage = utils.findMessageByFunc('store.open');
            expect(openMessage).not.toBeNull();
            expect(openMessage?.args).toEqual([argsAppDetail]);
          });
        });

        it(`should throw error when trying to open store but getting invalid store type in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          // eslint-disable-next-line strict-null-checks/all
          store.openStoreExperience(paramInvalidStoreType as store.OpenAppDetailParams).catch((e) => {
            expect(e).toEqual(new Error(store.errorInvalidDialogType));
          });
        });

        it(`should throw error when trying to open store with navigation to a specific collection but lack collection id in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          // eslint-disable-next-line strict-null-checks/all
          store.openStoreExperience(paramStoreNoId as store.OpenAppDetailParams).catch((e) => {
            expect(e).toEqual(new Error(store.errorMissingCollectionId));
          });
        });

        it(`should throw error when trying to open app details but lack app id in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          // eslint-disable-next-line strict-null-checks/all
          store.openStoreExperience(paramAppDetailNoId as store.OpenAppDetailParams).catch((e) => {
            expect(e).toEqual(new Error(store.errorMissingAppId));
          });
        });
      }
    });
  });
});
