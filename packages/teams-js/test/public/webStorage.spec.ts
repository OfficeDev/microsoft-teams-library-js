import { compareSDKVersions } from '../../src/internal/utils';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize, generateBackCompatRuntimeConfig } from '../../src/public/runtime';
import { webStorage } from '../../src/public/webStorage';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('webStorage', () => {
  const framelessPlatformMock = new FramelessPostMocks();
  const framedPlatformMock = new Utils();
  const testVersions = ['1.8.0', '2.0.4', '2.0.5', '2.0.6'];
  const minMobileVersionForWebStorage = '2.0.5';

  beforeEach(() => {
    framelessPlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(framelessPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framedPlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      framedPlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
    jest.clearAllMocks();
  });

  describe('webStorage.isWebStorageClearedOnUserLogOut', () => {
    it('should not allow calls before initialization', () => {
      expect(webStorage.isWebStorageClearedOnUserLogOut).toThrowError('The library has not yet been initialized');
    });

    const supportedMobileClientTypes = [HostClientType.ios, HostClientType.android];

    describe('Framed - isWebStorageClearedOnUserLogOut', () => {
      Object.values(FrameContexts).forEach(frameContext => {
        Object.values(HostClientType).forEach(clientType => {
          // desktop HostClientType is always supported
          if (clientType === HostClientType.desktop) {
            it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext} and hostClientType ${clientType}`, async () => {
              await framedPlatformMock.initializeWithContext(frameContext, clientType);
              expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
            });
          } else {
            Object.values(testVersions).forEach(version => {
              // mobile hostClientType is supported with valid version
              if (compareSDKVersions(version, minMobileVersionForWebStorage) >= 0) {
                if (supportedMobileClientTypes.some(supportedClientType => supportedClientType === clientType)) {
                  it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await framedPlatformMock.initializeWithContext(frameContext, clientType);
                    framedPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
                  });
                } else {
                  it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await framedPlatformMock.initializeWithContext(frameContext, clientType);
                    framedPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).not.toBeTruthy();
                  });
                }
              } else {
                // not supported for any client type with invalid version
                it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                  await framedPlatformMock.initializeWithContext(frameContext, clientType);
                  framedPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                  expect(webStorage.isWebStorageClearedOnUserLogOut()).not.toBeTruthy();
                });
              }
            });
          }
        });
      });
    }); // end framed

    describe('Frameless - isWebStorageClearedOnUserLogOut', () => {
      Object.values(FrameContexts).forEach(frameContext => {
        Object.values(HostClientType).forEach(clientType => {
          // desktop HostClientType is always supported
          if (clientType === HostClientType.desktop) {
            it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext} and hostClientType ${clientType}`, async () => {
              await framelessPlatformMock.initializeWithContext(frameContext, clientType);
              expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
            });
          } else {
            Object.values(testVersions).forEach(version => {
              //mobile HostClientType is supported for valid version
              if (compareSDKVersions(version, minMobileVersionForWebStorage) >= 0) {
                if (supportedMobileClientTypes.some(supportedClientType => supportedClientType === clientType)) {
                  it(`webStorage.isWebStorageClearedOnUserLogOut should allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await framelessPlatformMock.initializeWithContext(frameContext, clientType);
                    framelessPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).toBeTruthy();
                  });
                } else {
                  it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                    await framelessPlatformMock.initializeWithContext(frameContext, clientType);
                    framelessPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                    expect(webStorage.isWebStorageClearedOnUserLogOut()).not.toBeTruthy();
                  });
                }
              } else {
                // not supported for any client type with invalid version
                it(`webStorage.isWebStorageClearedOnUserLogOut should not allow call for context ${frameContext}, hostClientType ${clientType} and version ${version}`, async () => {
                  await framelessPlatformMock.initializeWithContext(frameContext, clientType);
                  framelessPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
                  expect(webStorage.isWebStorageClearedOnUserLogOut()).not.toBeTruthy();
                });
              }
            });
          }
        });
      });
    }); // end frameless
  });

  describe('Framed - isSupported', () => {
    it('webStorage.isSupported should return false if the runtime says webStorage is not supported', () => {
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(webStorage.isSupported()).not.toBeTruthy();
    });

    it('webStorage.isSupported should return true if the runtime says webStorage is supported', () => {
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });
      expect(webStorage.isSupported()).toBeTruthy();
    });
  });
  describe('Frameless - isSupported', () => {
    it('webStorage.isSupported should return false if the runtime says webStorage is not supported', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.task, HostClientType.ios);
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(webStorage.isSupported()).not.toBeTruthy();
    });

    it('webStorage.isSupported should return true if the runtime says webStorage is supported', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.task, HostClientType.ios);
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });
      expect(webStorage.isSupported()).toBeTruthy();
    });
  });
});