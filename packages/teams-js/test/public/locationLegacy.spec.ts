/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { locationAPIsRequiredVersion } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, location, SdkError } from '../../src/public/index';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for location APIs
 */
describe('location_V1', () => {
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

  const emptyCallback = () => {};

  it('should not allow getLocation calls before initialization', () => {
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('getLocation call in default version of platform support fails', done => {
    framelessPlatform.initializeWithContext(FrameContexts.task).then(() => {
      framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

      location.getLocation(defaultLocationProps, (err: SdkError, l: location.Location) => {
        expect(err).not.toBeNull();
        expect(err.errorCode).toBe(ErrorCode.OLD_PLATFORM);
        done();
      });
    });
  });
  it('should not allow getLocation calls for authentication frame context', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.authentication);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
    );
  });
  it('should not allow getLocation calls for remove frame context', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.remove);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'This call is only allowed in following contexts: ["content","task"]. Current context: "remove".',
    );
  });
  it('should not allow getLocation calls for settings frame context', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.settings);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
      'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
    );
  });
  it('should not allow getLocation calls without props', done => {
    framedPlatform.initializeWithContext(FrameContexts.content).then(() => {
      framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.getLocation(undefined, (e: SdkError, l: location.Location) => {
        expect(e).not.toBeNull();
        expect(e.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
        done();
      });
    });
  });
  it('should allow getLocation calls in desktop', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.content);
    framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.getLocation(defaultLocationProps, emptyCallback);
    const message = framedPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in task frameContext works', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.getLocation(defaultLocationProps, emptyCallback);
    const message = framelessPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation call in content frameContext works', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.getLocation(defaultLocationProps, emptyCallback);
    const message = framelessPlatform.findMessageByFunc('location.getLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocationProps);
  });
  it('getLocation calls with successful result', done => {
    framelessPlatform.initializeWithContext(FrameContexts.content).then(() => {
      framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
      framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

      location.getLocation(defaultLocationProps, (error: SdkError, loc: location.Location) => {
        expect(error).toBeFalsy();
        expect(loc).not.toBeNull();
        expect(loc.latitude).toBe(defaultLocation.latitude);
        expect(loc.longitude).toBe(defaultLocation.longitude);
        expect(loc.accuracy).toBe(defaultLocation.accuracy);
        expect(loc.timestamp).toBe(defaultLocation.timestamp);
        done();
      });

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
    });
  });
  it('getLocation calls with error', done => {
    framelessPlatform.initializeWithContext(FrameContexts.content).then(() => {
      framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
      framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

      location.getLocation(defaultLocationProps, (error: SdkError, loc: location.Location) => {
        expect(loc).toBeFalsy();
        expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
        done();
      });

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
    });
  });

  it('should not allow showLocation calls before initialization', () => {
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('showLocation call in default version of platform support fails', done => {
    framelessPlatform.initializeWithContext(FrameContexts.task).then(() => {
      framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

      location.showLocation(defaultLocation, (error: SdkError, v: boolean) => {
        expect(error).not.toBeNull();
        expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
        done();
      });
    });
  });
  it('should not allow showLocation calls for authentication frame context', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.authentication);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
    );
  });
  it('should not allow showLocation calls for remove frame context', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.remove);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      'This call is only allowed in following contexts: ["content","task"]. Current context: "remove".',
    );
  });
  it('should not allow showLocation calls for settings frame context', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.settings);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
      'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
    );
  });
  it('should not allow showLocation calls without props', done => {
    framedPlatform.initializeWithContext(FrameContexts.content).then(() => {
      framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);

      location.showLocation(null, (error: SdkError, v: boolean) => {
        expect(error).not.toBeNull();
        expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
        done();
      });
    });
  });
  it('should allow showLocation calls in desktop', () => {
    framedPlatform.initializeWithContext(FrameContexts.content);
    framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.showLocation(defaultLocation, emptyCallback);
    const message = framedPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in task frameContext works', () => {
    framelessPlatform.initializeWithContext(FrameContexts.task);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.showLocation(defaultLocation, emptyCallback);
    const message = framelessPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation call in content frameContext works', () => {
    framelessPlatform.initializeWithContext(FrameContexts.content);
    framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
    location.showLocation(defaultLocation, emptyCallback);
    const message = framelessPlatform.findMessageByFunc('location.showLocation');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(defaultLocation);
  });
  it('showLocation calls with successful result', done => {
    framelessPlatform.initializeWithContext(FrameContexts.content).then(() => {
      framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
      framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

      location.showLocation(defaultLocation, (error: SdkError, value: boolean) => {
        expect(error).toBeFalsy();
        expect(value).toBe(true);
        done();
      });

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
    });
  });
  it('showLocation calls with error', done => {
    framelessPlatform.initializeWithContext(FrameContexts.content).then(() => {
      framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
      framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

      location.showLocation(defaultLocation, (error: SdkError, value: boolean) => {
        expect(value).toBeFalsy();
        expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
        done();
      });

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
    });
  });

  it('Frameless - getLocation should throw error when not supported in the runtime config', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.getLocation(defaultLocationProps, emptyCallback);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });
  it('Frameless - showLocation should throw error when location is not supported', async () => {
    await framelessPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.showLocation(defaultLocation, emptyCallback);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });

  it('Framed - getLocation should throw error when location is not supported in the runtime config', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.getLocation(defaultLocationProps, emptyCallback);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });

  it('Framed - showLocation should throw error when location is not supported', async () => {
    await framedPlatform.initializeWithContext(FrameContexts.task);
    framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
    const promise = location.showLocation(defaultLocation, emptyCallback);
    await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  });
});
