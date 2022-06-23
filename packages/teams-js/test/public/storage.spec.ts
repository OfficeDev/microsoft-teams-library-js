import { ErrorCode } from '../../src/public';
import { app } from '../../src/public/app';
import { storage } from '../../src/public/storage';
import { Utils } from '../utils';
import {FrameContexts,HostClientType } from '../../src/public/constants';
import { FramelessPostMocks } from '../framelessPostMocks';

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
      app._uninitialize();
    }
    jest.clearAllMocks();
  });

  describe('isWebStorageClearedOnUserLogOut', () => {
    
      it('should not allow calls before initialization', () => {
      
      expect(storage.isWebStorageClearedOnUserLogOut).toThrowError(
        'The library has not yet been initialized',
      );
    });
   it('should always allow isWebStorageClearedOnUserLogOut calls in desktop', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.content,HostClientType.desktop);
      const result = storage.isWebStorageClearedOnUserLogOut();
      expect(result).toBeTruthy();
    });
    it('should never allow isWebStorageClearedOnUserLogOut calls in web', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.content,HostClientType.web);
      const result = storage.isWebStorageClearedOnUserLogOut();
      expect(result).not.toBeTruthy();
    }) 
  });
  describe('isSupported', () => {
    it('storage.isSupported should return false if the runtime says storage is not supported', () => {
      desktopPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(storage.isSupported()).not.toBeTruthy();
    });

    it('storage.isSupported should return true if the runtime says storage is supported', async () => {
      desktopPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {storage} });
      expect(storage.isSupported()).toBeTruthy();
    });
  });
});

