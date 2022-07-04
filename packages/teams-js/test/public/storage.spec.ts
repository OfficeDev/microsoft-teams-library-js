import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { storage } from '../../src/public/storage';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('storage', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();

  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      desktopPlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      mobilePlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
    jest.clearAllMocks();
  });

  describe('isWebStorageClearedOnUserLogOut', () => {
    it('should not allow calls before initialization', () => {
      expect(storage.isWebStorageClearedOnUserLogOut).toThrowError('The library has not yet been initialized');
    });
    Object.values(FrameContexts).forEach(context => {
      it('should always allow isWebStorageClearedOnUserLogOut calls in desktop for all contexts', async () => {
        await desktopPlatformMock.initializeWithContext(context, HostClientType.desktop);
        const result = storage.isWebStorageClearedOnUserLogOut();
        expect(result).toBeTruthy();
      });
  });
    Object.values(FrameContexts).forEach(context => {
      it('should never allow isWebStorageClearedOnUserLogOut calls in web for all contexts', async () => {
        await desktopPlatformMock.initializeWithContext(FrameContexts.content, HostClientType.web);
        const result = storage.isWebStorageClearedOnUserLogOut();
        expect(result).not.toBeTruthy();
      });
    });
    Object.values(FrameContexts).forEach(context => {
      it('should allow calls isWebStorageClearedOnUserLogOut calls in mobile for all contexts', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {storage: {}}});
          const result = storage.isWebStorageClearedOnUserLogOut();
          expect(result).toBeTruthy();
      });
    });
  });

  describe('Framed - isSupported', () => {
    it('storage.isSupported should return false if the runtime says storage is not supported', () => {
      desktopPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(storage.isSupported()).not.toBeTruthy();
    });

    it('storage.isSupported should return true if the runtime says storage is supported', () => {
      desktopPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {storage: {}}});
      expect(storage.isSupported()).toBeTruthy();
    });
  });
  describe('Frameless - isSupported', () => {
    it('storage.isSupported should return false if the runtime says storage is not supported', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.ios);
      mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(storage.isSupported()).not.toBeTruthy();
    });

    it('storage.isSupported should return true if the runtime says storage is supported', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.ios);
      mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {storage: {}}});
      expect(storage.isSupported()).toBeTruthy();
    });
  });
});