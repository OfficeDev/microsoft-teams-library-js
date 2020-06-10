import { captureImage, SdkError, ErrorCode, File, FileFormat } from '../../src/public/index' 
import { FramelessPostMocks } from '../framelessPostMocks';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { frameContexts } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { Utils } from '../utils';

/**
 * Test cases for device APIs
 */
describe('media', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils()
  const minVersionForCaptureImage = '1.7.0';
  
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

  it('should not allow captureImage calls with null callback', () => {
    expect(() => captureImage(null)).toThrowError(
      '[captureImage] Callback cannot be null',
    );
  });
  it('should not allow captureImage calls with null callback after init context', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => captureImage(null)).toThrowError(
      '[captureImage] Callback cannot be null',
    );
  });
  it('should not allow captureImage calls before initialization', () => {
    expect(() => captureImage(emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('captureImage call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.task);
    let error;
    captureImage((e: SdkError, f: File[]) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });
  it('should not allow captureImage calls for authentication frame context', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => captureImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow captureImage calls for remove frame context', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => captureImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow captureImage calls for settings frame context', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => captureImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow captureImage calls in desktop', () => {
    desktopPlatformMock.initializeWithContext(frameContexts.content);
    let error;
    captureImage((e: SdkError, f: File[]) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.NOT_SUPPORTED_ON_PLATFORM);
  });
  it('captureImage call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    captureImage(emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('captureImage call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    captureImage(emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('captureImage calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    let files, error;
    captureImage((e: SdkError, f: File[]) => {
      error = e;
      files = f;
    });

    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    let callbackId = message.id;
    let filesArray = [{
        content: 'base64encodedImage',
        format: FileFormat.Base64,
        mimeType: 'image/png',
        size: 300,
      } as File];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, filesArray]
      }
    } as DOMMessageEvent)

    expect(error).toBeFalsy();
    expect(files.length).toBe(1);
    let file = files[0];
    expect(file).not.toBeNull();
    expect(file.format).toBe(FileFormat.Base64);
    expect(file.mimeType).toBe('image/png');
    expect(file.content).not.toBeNull();
    expect(file.size).not.toBeNull();
    expect(typeof file.size === 'number').toBeTruthy();
  });
  it('captureImage calls with error', () => {
    mobilePlatformMock.initializeWithContext(frameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    let files, error;
    captureImage((e: SdkError, f: File[]) => {
      error = e;
      files = f;
    });

    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{errorCode: ErrorCode.PERMISSION_DENIED}]
      }
    } as DOMMessageEvent)

    expect(files).toBeFalsy();
    expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
  });
});