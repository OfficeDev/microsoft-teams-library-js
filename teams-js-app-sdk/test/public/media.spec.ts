import { FramelessPostMocks } from '../framelessPostMocks';
import { core } from '../../src/public/publicAPIs';
import { FrameContexts } from '../../src/public/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { SdkError, ErrorCode } from '../../src/public/interfaces';
import { Utils } from '../utils';
import { media } from '../../src/public/media';

/**
 * Test cases for device APIs
 */
describe('media', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils()
  const minVersionForCaptureImage = '1.7.0';
  const mediaAPISupportVersion = '1.8.0';

  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    core._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (core._uninitialize) {
      core._uninitialize();
    }
  });

  let emptyCallback = () => {};

  it('should not allow captureImage calls with null callback', () => {
    expect(() => media.captureImage(null)).toThrowError(
      '[captureImage] Callback cannot be null',
    );
  });
  it('should not allow captureImage calls with null callback after init context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => media.captureImage(null)).toThrowError(
      '[captureImage] Callback cannot be null',
    );
  });
  it('should not allow captureImage calls before initialization', () => {
    expect(() => media.captureImage(emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('captureImage call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    let error;
    media.captureImage((e: SdkError, f: media.File[]) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });
  it('should not allow captureImage calls for authentication frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => media.captureImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow captureImage calls for remove frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => media.captureImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow captureImage calls for settings frame context', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    expect(() => media.captureImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow captureImage calls in desktop', () => {
    desktopPlatformMock.initializeWithContext(FrameContexts.content);
    let error;
    media.captureImage((e: SdkError, f: media.File[]) => {
      error = e;
    });
    expect(error).not.toBeNull();
    expect(error.errorCode).toBe(ErrorCode.NOT_SUPPORTED_ON_PLATFORM);
  });
  it('captureImage call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    media.captureImage(emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('captureImage call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    media.captureImage(emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('captureImage calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    let files, error;
    media.captureImage((e: SdkError, f: media.File[]) => {
      error = e;
      files = f;
    });

    let message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    let callbackId = message.id;
    let filesArray = [{
        content: 'base64encodedImage',
        format: media.FileFormat.Base64,
        mimeType: 'image/png',
        size: 300,
      } as media.File];
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
    expect(file.format).toBe(media.FileFormat.Base64);
    expect(file.mimeType).toBe('image/png');
    expect(file.content).not.toBeNull();
    expect(file.size).not.toBeNull();
    expect(typeof file.size === 'number').toBeTruthy();
  });
  it('captureImage calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    let files, error;
    media.captureImage((e: SdkError, f: media.File[]) => {
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

  /**
   * Select Media tests
   */
  it('should not allow selectMedia calls with null callback', () => {
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 5,
    };
    expect(() => media.selectMedia(mediaInputs, null)).toThrowError(
      '[select Media] Callback cannot be null',
    );
  });

  it('should not allow selectMedia calls with null mediaInputs', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaError: SdkError;
    media.selectMedia(null, (error: SdkError, attachments: media.Media[]) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('should not allow selectMedia calls with invalid mediaInputs', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 11,
    };
    let mediaError: SdkError;
    media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('selectMedia call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    let mediaError: SdkError;
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });

  it('selectMedia call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectMedia call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectMedia calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaAttachments: media.Media[], mediaError: SdkError;
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs, (e: SdkError, m: media.Media[]) => {
      mediaError = e;
      mediaAttachments = m;
    });

    let message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    let callbackId = message.id;
    let filesArray = [{
      content: 'base64encodedImage',
      preview: null,
      format: media.FileFormat.ID,
      mimeType: 'image/jpeg',
      size: 300,
    } as media.Media];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, filesArray]
      }
    } as DOMMessageEvent)

    expect(mediaError).toBeFalsy();
    expect(mediaAttachments.length).toBe(1);
    let mediaAttachment = mediaAttachments[0];
    expect(mediaAttachment).not.toBeNull();
    expect(mediaAttachment.format).toBe(media.FileFormat.ID);
    expect(mediaAttachment.mimeType).toBe('image/jpeg');
    expect(mediaAttachment.content).not.toBeNull();
    expect(mediaAttachment.size).not.toBeNull();
    expect(typeof mediaAttachment.size === 'number').toBeTruthy();
    expect(mediaAttachment.getMedia).toBeDefined();
  });

  it('selectMedia calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaAttachments: media.Media[], mediaError: SdkError;
    let mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs, (e: SdkError, m: media.Media[]) => {
      mediaError = e;
      mediaAttachments = m;
    });

    let message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.SIZE_EXCEEDED }]
      }
    } as DOMMessageEvent)

    expect(mediaAttachments).toBeFalsy();
    expect(mediaError.errorCode).toBe(ErrorCode.SIZE_EXCEEDED);
  });

  /**
   * Get Media tests
   */
  it('should not allow getMedia calls with null callback', () => {
    let mediaOutput: media.Media = new media.Media();
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.ID;
    expect(() => mediaOutput.getMedia(null)).toThrowError(
      '[get Media] Callback cannot be null',
    );
  });

  it('should not allow getMedia calls with invalid media mimetype', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaOutput: media.Media = new media.Media();
    let mediaError: SdkError;
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = null;
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia((error: SdkError, blob: Blob) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('should not allow getMedia calls with invalid media content', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaOutput: media.Media = new media.Media();
    let mediaError: SdkError;
    mediaOutput.content = null;
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia((error: SdkError, blob: Blob) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('should not allow getMedia calls with invalid media file format', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaOutput: media.Media = new media.Media();
    let mediaError: SdkError;
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.Base64;
    mediaOutput.getMedia((error: SdkError, blob: Blob) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('getMedia call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    let mediaOutput: media.Media = new media.Media();
    let mediaError: SdkError;
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia((error: SdkError, blob: Blob) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });

  it('getMedia call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaOutput: media.Media = new media.Media();
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia(emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('getMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
  });

  it('getMedia calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let file: Blob, mediaError: SdkError;
    let mediaOutput: media.Media = new media.Media();
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia((error: SdkError, blob: Blob) => {
      mediaError = error;
      file = blob;
    });

    let message = mobilePlatformMock.findMessageByFunc('getMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);

    let callbackId = message.id;
    let blob: Blob = new Blob();
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, blob]
      }
    } as DOMMessageEvent)
    expect(mediaError).toBeFalsy();
    expect(file).not.toBeNull();
  });

  it('getMedia calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let file: Blob, mediaError: SdkError;
    let mediaOutput: media.Media = new media.Media();
    mediaOutput.content = "1234567";
    mediaOutput.mimeType = "image/jpeg";
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia((error: SdkError, blob: Blob) => {
      mediaError = error;
      file = blob;
    });

    let message = mobilePlatformMock.findMessageByFunc('getMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, undefined]
      }
    } as DOMMessageEvent)
    expect(mediaError).toBeFalsy();
    expect(file).toBeFalsy();
  });

  /**
   * View Images
   */
  it('should not allow viewImages calls with null callback', () => {
    let uris: media.ImageUri[] = [];
    let uri: media.ImageUri = {
      value: "https://www.w3schools.com/images/picture.jpg",
      type: media.ImageUriType.URL
    };
    uris.push(uri);
    expect(() => media.viewImages(uris, null)).toThrowError(
      '[view images] Callback cannot be null',
    );
  });

  it('should not allow viewImages calls with null imageuris', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaError: SdkError;
    media.viewImages(null, (error: SdkError) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('should not allow viewImages calls with invalid imageuris', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let uris: media.ImageUri[] = [];
    let mediaError: SdkError;
    media.viewImages(uris, (error: SdkError) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
  });

  it('viewImages call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    let mediaError: SdkError;
    let uris: media.ImageUri[] = [];
    let uri: media.ImageUri = {
      value: "https://www.w3schools.com/images/picture.jpg",
      type: media.ImageUriType.URL
    };
    uris.push(uri);
    media.viewImages(uris, (error: SdkError) => {
      mediaError = error;
    });
    expect(mediaError).not.toBeNull();
    expect(mediaError.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });

  it('viewImages call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let uris: media.ImageUri[] = [];
    let uri: media.ImageUri = {
      value: "https://www.w3schools.com/images/picture.jpg",
      type: media.ImageUriType.URL
    };
    uris.push(uri);
    media.viewImages(uris, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('viewImages');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('viewImages call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let uris: media.ImageUri[] = [];
    let uri: media.ImageUri = {
      value: "https://www.w3schools.com/images/picture.jpg",
      type: media.ImageUriType.URL
    };
    uris.push(uri);
    media.viewImages(uris, emptyCallback);
    let message = mobilePlatformMock.findMessageByFunc('viewImages');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('viewImages calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    let mediaError: SdkError;
    let uris: media.ImageUri[] = [];
    let uri: media.ImageUri = {
      value: "1234567",
      type: media.ImageUriType.ID
    };
    uris.push(uri);
    media.viewImages(uris, (error: SdkError) => {
      mediaError = error;
    });

    let message = mobilePlatformMock.findMessageByFunc('viewImages');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    let callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.FILE_NOT_FOUND }]
      }
    } as DOMMessageEvent)
    expect(mediaError.errorCode).toBe(ErrorCode.FILE_NOT_FOUND);
  });
});
