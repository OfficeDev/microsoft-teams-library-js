import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { store } from '../../src/private/store';
import { app, DialogInfo } from '../../src/public';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
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
    const paramFullStore: store.OpenStoreParams = {
      dialogType: store.StoreDialogTypeEnum.fullStore,
    };
    const respFullStore: DialogInfo = {
      url: store.StoreUrl.fullStore,
      height: DialogDimension.Medium,
      width: DialogDimension.Medium,
    };
    const paramAppDetailWithoutId: store.OpenStoreParams = {
      dialogType: store.StoreDialogTypeEnum.appDetail,
    };

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when dialog is not supported in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: {} });
          try {
            store.openStoreExperience(paramFullStore);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`should pass along entire openStoreExperience parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          store.openStoreExperience(paramFullStore).then(() => {
            const openMessage = utils.findMessageByFunc('store.open');
            expect(openMessage).not.toBeNull();
            expect(openMessage?.args).toEqual([respFullStore]);
          });
        });

        it(`should throw error when trying to open app details but lack app id in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          try {
            store.openStoreExperience(paramAppDetailWithoutId);
          } catch (e) {
            expect(e).toEqual(store.errorMissingAppId);
          }
        });
      }
    });
  });
});
