import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { store } from '../../src/private';
import { app, AppId } from '../../src/public';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize, latestRuntimeApiVersion } from '../../src/public/runtime';
import { Utils } from '../utils';

const appId1 = new AppId('1542629c-01b3-4a6d-8f76-1938b779e48d');
const appId2 = new AppId('1542629c-01b3-4a6d-8f76-940934572634');

const paramEmpty: store.OpenFullStoreParams = {};

const paramFullStore: store.OpenFullStoreParams = {
  size: {
    width: DialogDimension.Large,
    height: 300,
  },
};
const argsFullStore = [JSON.stringify(paramFullStore.size)];
const paramFullStoreInvalidSize: store.OpenFullStoreParams = {
  size: {
    width: DialogDimension.Large,
    height: -300,
  },
};

const paramSpecificStore: store.OpenSpecificStoreParams = {
  collectionId: 'copilotextensions',
};
const argsSpecificStore = ['copilotextensions'];

const paramAppDetail: store.OpenAppDetailParams = {
  appId: appId1,
};
const argsAppDetail = [appId1.toString()];

const paramInContextStore: store.OpenInContextStoreParams = {
  appCapability: 'Bot',
  appMetaCapabilities: ['copilotPlugins', 'copilotExtensions'],
  installationScope: 'Team',
  filteredOutAppIds: [appId1, appId2],
};
const argsInContextStore = [
  'Bot',
  ['copilotPlugins', 'copilotExtensions'],
  'Team',
  [appId1.toString(), appId2.toString()],
];

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

  describe('open store', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];

    it('store.openFullStore should not allow calls before initialization', async () => {
      await expect(() => store.openFullStore(paramEmpty)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when dialog is not supported in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: {} });
          store.openFullStore(paramEmpty).catch((e) => {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          });
        });

        it(`store.openFullStore should pass along entire parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openFullStore(paramFullStore).then(() => {
            const openMessage = utils.findMessageByFunc('store.openFullStore');
            expect(openMessage).not.toBeNull();
            expect(openMessage?.args).toEqual([argsFullStore]);
          });
        });

        it(`store.openFullStore should throw error when have invalid dialog size in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openFullStore(paramFullStoreInvalidSize).catch((e) => {
            expect(e).toEqual(new Error('Invalid store dialog size'));
          });
        });

        it(`store.openSpecificStore should pass along entire parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openSpecificStore(paramSpecificStore).then(() => {
            const openMessage = utils.findMessageByFunc('store.openSpecificStore');
            expect(openMessage).not.toBeNull();
            expect(openMessage?.args).toEqual([argsSpecificStore]);
          });
        });

        it(`store.openSpecificStore should throw error when lacking collection id in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openSpecificStore(paramEmpty as store.OpenSpecificStoreParams).catch((e) => {
            expect(e).toEqual(
              new Error('No Collection Id present, but CollectionId needed to open a store specific to a collection'),
            );
          });
        });

        it(`store.openAppDetail should pass along entire parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openAppDetail(paramAppDetail).then(() => {
            const openMessage = utils.findMessageByFunc('store.openAppDetail');
            expect(openMessage).not.toBeNull();
            expect(openMessage?.args).toEqual([argsAppDetail]);
          });
        });

        it(`store.openAppDetail should throw error when lacking app id in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openAppDetail(paramEmpty as store.OpenAppDetailParams).catch((e) => {
            expect(e).toEqual(new Error('No App Id present, but AppId needed to open AppDetail store'));
          });
        });

        it(`store.openInContextStore should pass along entire parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: latestRuntimeApiVersion, supports: { store: {} } });
          store.openInContextStore(paramInContextStore).then(() => {
            const openMessage = utils.findMessageByFunc('store.openInContextStore');
            expect(openMessage).not.toBeNull();
            expect(openMessage?.args).toEqual([argsInContextStore]);
          });
        });
      }
    });
  });
});
