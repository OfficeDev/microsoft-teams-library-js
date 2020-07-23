import { getLocation, showLocation, SdkError, ErrorCode, LocationProps, Location } from '../../src/public/index' 
import { FramelessPostMocks } from '../framelessPostMocks';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { Utils } from '../utils';
import { FrameContexts } from '../../src/public/constants';
import { locationAPIsRequiredVersion } from '../../src/public/location';

/**
 * Test cases for location APIs
 */
describe('location', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils()
  const minVersionForLocationAPIs = locationAPIsRequiredVersion;
  const defaultLocationProps: LocationProps = {allowChooseLocation: false, showMap: false};
  const defaultLocation: Location = {latitude: 17, longitude: 17, accuracy: -1, timestamp: 100};
  
  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    _initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  let emptyCallback = () => {};

  it('should not allow getLocation calls with null callback', () => {
    expect(() => getLocation(defaultLocationProps, null)).toThrowError(
      '[getLocation] Callback cannot be null',
    );
  });
  it('should not allow getLocation calls with null callback after init context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => getLocation(defaultLocationProps, null)).toThrowError(
      '[getLocation] Callback cannot be null',
    );
  });
  it('should not allow getLocation calls before initialization', () => {
    expect(() => getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('getLocation call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    let error;
    getLocation(defaultLocationProps, (e: SdkError, l: Location) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });
  it('should not allow getLocation calls for authentication frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow getLocation calls for remove frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow getLocation calls for settings frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should allow getLocation calls in desktop', () => {
    desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    getLocation(defaultLocationProps, emptyCallback);
    let message = desktopPlatformMock.findMessageByFunc('getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    getLocation(defaultLocationProps, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    getLocation(defaultLocationProps, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let location, error;
    getLocation(defaultLocationProps, (e: SdkError, l: Location) => {
      error = e;
      location = l;
    });

    let message = mobilePlatformMock.findMessageByFunc('getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, defaultLocation]
      }
    } as DOMMessageEvent)

    expect(error).toBeFalsy();
    expect(location).not.toBeNull();
    expect(location.latitude).toBe(defaultLocation.latitude);
    expect(location.longitude).toBe(defaultLocation.longitude);
    expect(location.accuracy).toBe(defaultLocation.accuracy);
    expect(location.timestamp).toBe(defaultLocation.timestamp);
  });
  it('getLocation calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let location, error;
    getLocation(defaultLocationProps, (e: SdkError, l: Location) => {
      error = e;
      location = l;
    });

    let message = mobilePlatformMock.findMessageByFunc('getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{errorCode: ErrorCode.PERMISSION_DENIED}]
      }
    } as DOMMessageEvent)

    expect(location).toBeFalsy();
    expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
  });

  it('should not allow showLocation calls with null callback', () => {
    expect(() => showLocation(defaultLocation, null)).toThrowError(
      '[showLocation] Callback cannot be null',
    );
  });
  it('should not allow showLocation calls with null callback after init context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => showLocation(defaultLocation, null)).toThrowError(
      '[showLocation] Callback cannot be null',
    );
  });
  it('should not allow showLocation calls before initialization', () => {
    expect(() => showLocation(defaultLocation, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('showLocation call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    let error;
    showLocation(defaultLocation, (e: SdkError, v: boolean) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });
  it('should not allow showLocation calls for authentication frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => showLocation(defaultLocation, emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow showLocation calls for remove frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => showLocation(defaultLocation, emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow showLocation calls for settings frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => showLocation(defaultLocation, emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should allow showLocation calls in desktop', () => {
    desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    showLocation(defaultLocation, emptyCallback);
    let message = desktopPlatformMock.findMessageByFunc('showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    showLocation(defaultLocation, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    showLocation(defaultLocation, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let value, error;
    showLocation(defaultLocation, (e: SdkError, v: boolean) => {
      error = e;
      value = v;
    });

    let message = mobilePlatformMock.findMessageByFunc('showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, true]
      }
    } as DOMMessageEvent)

    expect(error).toBeFalsy();
    expect(value).toBe(true);
  });
  it('showLocation calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    let value, error;
    showLocation(defaultLocation, (e: SdkError, v: boolean) => {
      error = e;
      value = v;
    });

    let message = mobilePlatformMock.findMessageByFunc('showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{errorCode: ErrorCode.PERMISSION_DENIED}]
      }
    } as DOMMessageEvent)

    expect(value).toBeFalsy();
    expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
  });
});