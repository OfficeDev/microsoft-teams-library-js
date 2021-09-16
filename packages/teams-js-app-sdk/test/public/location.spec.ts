import { ErrorCode, location } from '../../src/public/index';
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

  it('should not allow getLocation calls before initialization', () => {
    return expect(location.getLocation(defaultLocationProps)).rejects.toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('getLocation call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    await expect(location.getLocation(defaultLocationProps)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });
  it('should not allow getLocation calls for authentication frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.getLocation(defaultLocationProps)).rejects.toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow getLocation calls for remove frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.getLocation(defaultLocationProps)).rejects.toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow getLocation calls for settings frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.getLocation(defaultLocationProps)).rejects.toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow getLocation calls without props', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.getLocation(undefined)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });
  it('should allow getLocation calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps);
    const message = desktopPlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps);
    const message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps);
    const message = mobilePlatformMock.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    const promise = location.getLocation(defaultLocationProps);

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

    await expect(promise).resolves.toBe(defaultLocation);
  });
  it('getLocation calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    const promise = location.getLocation(defaultLocationProps);

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

    await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
  });

  it('should not allow showLocation calls before initialization', () => {
    return expect(location.showLocation(defaultLocation)).rejects.toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('showLocation call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    await expect(location.showLocation(defaultLocation)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });
  it('should not allow showLocation calls for authentication frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.showLocation(defaultLocation)).rejects.toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow showLocation calls for remove frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.showLocation(defaultLocation)).rejects.toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow showLocation calls for settings frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.showLocation(defaultLocation)).rejects.toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow showLocation calls without props', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.showLocation(null)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });
  it('should allow showLocation calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    desktopPlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation);
    const message = desktopPlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation);
    const message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation);
    const message = mobilePlatformMock.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    const promise = location.showLocation(defaultLocation);

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

    return expect(promise).resolves;
  });
  it('showLocation calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    const promise = location.showLocation(defaultLocation);

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

    await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
  });
});
