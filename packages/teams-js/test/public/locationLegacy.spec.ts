/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { locationAPIsRequiredVersion } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { ErrorCode, location, SdkError } from '../../src/public/index';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for location APIs
 */
describe('location_V1', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();
  const minVersionForLocationAPIs = locationAPIsRequiredVersion;
  const defaultLocationProps: location.LocationProps = { allowChooseLocation: false, showMap: false };
  const defaultLocation: location.Location = { latitude: 17, longitude: 17, accuracy: -1, timestamp: 100 };
  const originalDefaultPlatformVersion = '1.6.0';

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
  });

  const emptyCallback = () => {};

  it('should not allow getLocation calls before initialization', () => {
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('getLocation call in default version of platform support fails', done => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

      location.getLocation(defaultLocationProps, (err: SdkError, l: location.Location) => {
        expect(err).not.toBeNull();
        expect(err.errorCode).toBe(ErrorCode.OLD_PLATFORM);
        done();
      });
    });
  });
  it('should not allow getLocation calls for authentication frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow getLocation calls for remove frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow getLocation calls for settings frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow getLocation calls without props', done => {
    desktopPlatformMock.initializeWithContext(FrameContexts.content).then(() => {
      desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.getLocation(undefined, (e: SdkError, l: location.Location) => {
        expect(e).not.toBeNull();
        expect(e.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
        done();
      });
    });
  });
  it('should allow getLocation calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps, emptyCallback);
    const message = desktopPlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps, emptyCallback);
    const message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps, emptyCallback);
    const message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation calls with successful result', done => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
      mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.getLocation(defaultLocationProps, (error: SdkError, loc: location.Location) => {
        expect(error).toBeFalsy();
        expect(loc).not.toBeNull();
        expect(loc.latitude).toBe(defaultLocation.latitude);
        expect(loc.longitude).toBe(defaultLocation.longitude);
        expect(loc.accuracy).toBe(defaultLocation.accuracy);
        expect(loc.timestamp).toBe(defaultLocation.timestamp);
        done();
      });

      const message = mobilePlatformMock.findMessageByFunc('location.getLocation');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(defaultLocationProps);

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [undefined, defaultLocation],
        },
      } as DOMMessageEvent);
    });
  });
  it('getLocation calls with error', done => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
      mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.getLocation(defaultLocationProps, (error: SdkError, loc: location.Location) => {
        expect(loc).toBeFalsy();
        expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
        done();
      });

      const message = mobilePlatformMock.findMessageByFunc('location.getLocation');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(defaultLocationProps);

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
        },
      } as DOMMessageEvent);
    });
  });

  it('should not allow showLocation calls before initialization', () => {
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('showLocation call in default version of platform support fails', done => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

      location.showLocation(defaultLocation, (error: SdkError, v: boolean) => {
        expect(error).not.toBeNull();
        expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
        done();
      });
    });
  });
  it('should not allow showLocation calls for authentication frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow showLocation calls for remove frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow showLocation calls for settings frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow showLocation calls without props', done => {
    desktopPlatformMock.initializeWithContext(FrameContexts.content).then(() => {
      desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.showLocation(null, (error: SdkError, v: boolean) => {
        expect(error).not.toBeNull();
        expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
        done();
      });
    });
  });
  it('should allow showLocation calls in desktop', () => {
    desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation, emptyCallback);
    const message = desktopPlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation, emptyCallback);
    const message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation, emptyCallback);
    const message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation calls with successful result', done => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
      mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.showLocation(defaultLocation, (error: SdkError, value: boolean) => {
        expect(error).toBeFalsy();
        expect(value).toBe(true);
        done();
      });

      const message = mobilePlatformMock.findMessageByFunc('location.showLocation');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(defaultLocation);

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [undefined, true],
        },
      } as DOMMessageEvent);
    });
  });
  it('showLocation calls with error', done => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
      mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.showLocation(defaultLocation, (error: SdkError, value: boolean) => {
        expect(value).toBeFalsy();
        expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
        done();
      });

      const message = mobilePlatformMock.findMessageByFunc('location.showLocation');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(defaultLocation);

      const callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
        },
      } as DOMMessageEvent);
    });
  });
});
