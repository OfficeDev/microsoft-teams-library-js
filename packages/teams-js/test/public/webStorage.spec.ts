import { cli, version } from 'webpack-dev-middleware/node_modules/webpack';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { webStorage } from '../../src/public/webStorage';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';
import { generateBackCompatRuntimeConfig } from '../../src/public/runtime';
import { compareSDKVersions } from '../../src/internal/utils';

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

  describe('isWebStorageClearedOnUserLogOut', () => {
    it('should not allow calls before initialization', () => {
      expect(webStorage.isWebStorageClearedOnUserLogOut).toThrowError('The library has not yet been initialized');
    });
    Object.values(HostClientType).forEach(clientType => {
      Object.values(FrameContexts).forEach(context => {
        Object.values(testVersions).forEach(version => {
        it(`should allow Framed - isWebStorageClearedOnUserLogOut calls for version ${version} and context ${context} and hostClientType ${clientType}`, async () => {
          await framedPlatformMock.initializeWithContext(context, clientType);
          framedPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
          const result = webStorage.isWebStorageClearedOnUserLogOut();
          if(clientType === HostClientType.ios || clientType === HostClientType.android)
          {
            if (compareSDKVersions(version, minMobileVersionForWebStorage) >= 0) 
            {
              expect(result).toBeTruthy();
            }
            else
            {
              expect(result).not.toBeTruthy();
            }
           
          }
          else if (clientType === HostClientType.desktop)
          {
            expect(result).toBeTruthy();
          }
          else
          {
            expect(result).not.toBeTruthy();
          }  
        });
        it(`should allow Frameless - isWebStorageClearedOnUserLogOut calls for version ${version} and context ${context} and hostClientType ${clientType}`, async () => {
          await framelessPlatformMock.initializeWithContext(context, clientType);
          framelessPlatformMock.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
          const result = webStorage.isWebStorageClearedOnUserLogOut();
          if(clientType === HostClientType.ios || clientType === HostClientType.android)
          {
            if (compareSDKVersions(version, minMobileVersionForWebStorage) >= 0) 
            {
              expect(result).toBeTruthy();
            }
            else
            {
              expect(result).not.toBeTruthy();
            }
           
          }
          else if (clientType === HostClientType.desktop)
          {
            expect(result).toBeTruthy();
          }
          else
          {
            expect(result).not.toBeTruthy();
          } 
        });
      });
      });
    });
  });
  describe('Framed - isSupported', () => {
    it('webStorage.isSupported should return false if the runtime says webStorage is not supported', () => {
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(webStorage.isSupported()).not.toBeTruthy();
    });

    it('webStorage.isSupported should return true if the runtime says webStorage is supported', () => {
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {webStorage: {}}});
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
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {webStorage: {}}});
      expect(webStorage.isSupported()).toBeTruthy();
    });
  });
});