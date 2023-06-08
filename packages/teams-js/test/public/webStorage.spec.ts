import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { compareSDKVersions } from '../../src/internal/utils';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { generateBackCompatRuntimeConfig } from '../../src/public/runtime';
import { webStorage } from '../../src/public/webStorage';
import { Utils } from '../utils';

describe('webStorage', () => {
  const minMobileVersionForWebStorage = '2.0.5';
  const supportedMobileClientTypes = [HostClientType.ios, HostClientType.android];
  const testVersions = ['1.8.0', '2.0.4', '2.0.5', '2.0.6'];
  const utils = new Utils();
  describe('webStorage.isWebStorageClearedOnUserLogOut', () => {
    it('should not allow calls before initialization', () => {
      expect(webStorage.isWebStorageClearedOnUserLogOut).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('webStorage.isSupported should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => webStorage.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    describe('Framed', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.messages = [];
      });
      afterEach(() => {
        app._uninitialize();
      });
      Object.values(FrameContexts).forEach((frameContext) => {
        Object.values(HostClientType).forEach((clientType) => {
          // desktop HostClientType is always supported
          if (clientType === HostClientType.desktop) {
            it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext} and hostClientType ${clientType}`, async () => {
              await utils.initializeWithContext(frameContext, clientType);
              expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
            });
          } else {
            Object.values(testVersions).forEach((version) => {
              // mobile hostClientType is supported with valid version
              if (compareSDKVersions(version, minMobileVersionForWebStorage) >= 0) {
                if (supportedMobileClientTypes.some((supportedClientType) => supportedClientType === clientType)) {
                  it('webStorage.isSupported should return false if the runtime says webStorage is not supported', async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
                    expect(webStorage.isSupported()).not.toBeTruthy();
                  });

                  it('webStorage.isSupported should return true if the runtime says webStorage is supported', async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });
                    expect(webStorage.isSupported()).toBeTruthy();
                  });

                  it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
                  });
                } else {
                  it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).not.toBeTruthy();
                  });
                }
              } else {
                // not supported for any client type with invalid version
                it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                  await utils.initializeWithContext(frameContext, clientType);
                  utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                  expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeFalsy();
                });
              }
            });
          }
        });
      });
    }); // end framed

    describe('Frameless', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.mockWindow.parent = undefined;
        utils.messages = [];
        GlobalVars.isFramelessWindow = false;
      });
      afterEach(() => {
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });
      Object.values(FrameContexts).forEach((frameContext) => {
        Object.values(HostClientType).forEach((clientType) => {
          // desktop HostClientType is always supported
          if (clientType === HostClientType.desktop) {
            it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext} and hostClientType ${clientType}`, async () => {
              await utils.initializeWithContext(frameContext, clientType);
              expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
            });
          } else {
            Object.values(testVersions).forEach((version) => {
              //mobile HostClientType is supported for valid version
              if (compareSDKVersions(version, minMobileVersionForWebStorage) >= 0) {
                if (supportedMobileClientTypes.some((supportedClientType) => supportedClientType === clientType)) {
                  it('webStorage.isSupported should return false if the runtime says webStorage is not supported', async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
                    expect(webStorage.isSupported()).not.toBeTruthy();
                  });

                  it('webStorage.isSupported should return true if the runtime says webStorage is supported', async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });
                    expect(webStorage.isSupported()).toBeTruthy();
                  });

                  it('webStorage.isSupported should throw if called before initialization', () => {
                    utils.uninitializeRuntimeConfig();
                    expect(() => webStorage.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
                  });
                  it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
                  });
                } else {
                  it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await utils.initializeWithContext(frameContext, clientType);
                    utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).not.toBeTruthy();
                  });
                }
              } else {
                // not supported for any client type with invalid version
                it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                  await utils.initializeWithContext(frameContext, clientType);
                  utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                  expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeFalsy();
                });
              }
            });
          }
        });
      });
    }); // end frameless
  });
});
