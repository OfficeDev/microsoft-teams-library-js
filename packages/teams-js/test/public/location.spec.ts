import { locationAPIsRequiredVersion } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, location } from '../../src/public/index';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for location APIs
 */
describe('location', () => {
  const framelessPlatform = new FramelessPostMocks();
  const framedPlatform = new Utils();
  const minVersionForLocationAPIs = locationAPIsRequiredVersion;
  const defaultLocationProps: location.LocationProps = { allowChooseLocation: false, showMap: false };
  const defaultLocation: location.Location = { latitude: 17, longitude: 17, accuracy: -1, timestamp: 100 };
  const originalDefaultPlatformVersion = '1.6.0';

  beforeEach(() => {
    framelessPlatform.messages = [];

    // Set a mock window for testing
    app._initialize(framelessPlatform.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framedPlatform.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  it('should allow showLocation calls in desktop', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.content);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.showLocation(defaultLocation);
    const message = framedPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('should allow getLocation calls in desktop', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.content);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    location.getLocation(defaultLocationProps);
    const message = framedPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });

  it('getLocation call in default version of platform support fails', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    await expect(location.getLocation(defaultLocationProps)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });
  it('should not allow getLocation calls without props', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.content);
    framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    await expect(location.getLocation(undefined)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });
  it('getLocation call in task frameContext works', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.getLocation(defaultLocationProps);
    const message = framelessPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in content frameContext works', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.getLocation(defaultLocationProps);
    const message = framelessPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation calls with successful result', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    const promise = location.getLocation(defaultLocationProps);

    const message = framelessPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);

    const callbackId = message.id;
    framelessPlatform.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, defaultLocation],
      },
    } as DOMMessageEvent);

    await expect(promise).resolves.toBe(defaultLocation);
  });
  it('getLocation calls with error', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    const promise = location.getLocation(defaultLocationProps);

    const message = framelessPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);

    const callbackId = message.id;
    framelessPlatform.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
      },
    } as DOMMessageEvent);

    await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
  });

  it('showLocation call in default version of platform support fails', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    await expect(location.showLocation(defaultLocation)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });
  it('should not allow showLocation calls without props', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.content);
    framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    await expect(location.showLocation(null)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('showLocation call in task frameContext works', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.showLocation(defaultLocation);
    const message = framelessPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in content frameContext works', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.showLocation(defaultLocation);
    const message = framelessPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation calls with successful result', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    const promise = location.showLocation(defaultLocation);

    const message = framelessPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);

    const callbackId = message.id;
    framelessPlatform.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, true],
      },
    } as DOMMessageEvent);

    return expect(promise).resolves;
  });
  it('showLocation calls with error', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    const promise = location.showLocation(defaultLocation);

    const message = framelessPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);

    const callbackId = message.id;
    framelessPlatform.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
      },
    } as DOMMessageEvent);

    await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
  });
  it('Frameless - getLocation should throw error when not supported in the runtime config', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.getLocation(defaultLocationProps);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });
  it('Frameless - showLocation should throw error when location is not supported', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.showLocation(defaultLocation);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });

  it('Framed - getLocation should throw error when location is not supported in the runtime config', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.getLocation(defaultLocationProps);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });

  it('Framed - showLocation should throw error when location is not supported', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.showLocation(defaultLocation);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });
});
