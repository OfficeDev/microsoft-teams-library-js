/* eslint-disable @typescript-eslint/no-object-literal-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ErrorCode, location, SdkError } from '../../src/public/index';
import { FramelessPostMocks } from '../framelessPostMocks';
import { app } from '../../src/public/app';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { Utils } from '../utils';
import { FrameContexts } from '../../src/public/constants';
import { locationAPIsRequiredVersion } from '../../src/internal/constants';

/**
 * Test cases for location APIs
 */
describe('location', () => {
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

  let emptyCallback = () => {};

  it('should not allow getLocation calls with null callback', () => {
    expect(() => location.getLocation(defaultLocationProps, null)).toThrowError(
      '[location.getLocation] Callback cannot be null',
    );
  });
  it('should not allow getLocation calls with null callback after init context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, null)).toThrowError(
      '[location.getLocation] Callback cannot be null',
    );
  });
  it('should not allow getLocation calls before initialization', () => {
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('getLocation call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    let error;
    location.getLocation(defaultLocationProps, (e: SdkError, l: location.Location) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
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
  it('should not allow getLocation calls without props', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let error;
    location.getLocation(undefined, (e: SdkError, l: location.Location) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });
  it('should allow getLocation calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps, emptyCallback);
    let message = desktopPlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let loc, error;
    location.getLocation(defaultLocationProps, (e: SdkError, l: location.Location) => {
      error = e;
      loc = l;
    });

    let message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, defaultLocation],
      },
    } as DOMMessageEvent);

    expect(error).toBeFalsy();
    expect(location).not.toBeNull();
    expect(loc.latitude).toBe(defaultLocation.latitude);
    expect(loc.longitude).toBe(defaultLocation.longitude);
    expect(loc.accuracy).toBe(defaultLocation.accuracy);
    expect(loc.timestamp).toBe(defaultLocation.timestamp);
  });
  it('getLocation calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let loc, error;
    location.getLocation(defaultLocationProps, (e: SdkError, l: location.Location) => {
      error = e;
      loc = l;
    });

    let message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
      },
    } as DOMMessageEvent);

    expect(loc).toBeFalsy();
    expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
  });

  it('should not allow showLocation calls with null callback', () => {
    expect(() => location.showLocation(defaultLocation, null)).toThrowError(
      '[location.showLocation] Callback cannot be null',
    );
  });
  it('should not allow showLocation calls with null callback after init context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, null)).toThrowError(
      '[location.showLocation] Callback cannot be null',
    );
  });
  it('should not allow showLocation calls before initialization', () => {
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('showLocation call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    let error;
    location.showLocation(defaultLocation, (e: SdkError, v: boolean) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
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
  it('should not allow showLocation calls without props', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let error;
    location.showLocation(null, (e: SdkError, v: boolean) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });
  it('should allow showLocation calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation, emptyCallback);
    let message = desktopPlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let value, error;
    location.showLocation(defaultLocation, (e: SdkError, v: boolean) => {
      error = e;
      value = v;
    });

    let message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, true],
      },
    } as DOMMessageEvent);

    expect(error).toBeFalsy();
    expect(value).toBe(true);
  });
  it('showLocation calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let value, error;
    location.showLocation(defaultLocation, (e: SdkError, v: boolean) => {
      error = e;
      value = v;
    });

    let message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
      },
    } as DOMMessageEvent);

    expect(value).toBeFalsy();
    expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
  });
});
