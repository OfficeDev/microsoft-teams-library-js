/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getMediaCallbackSupportVersion, mediaAPISupportVersion } from '../../src/internal/constants';
import { callHandler } from '../../src/internal/handlers';
import { DOMMessageEvent, MessageRequest } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { ErrorCode } from '../../src/public/interfaces';
import { media } from '../../src/public/media';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for media APIs
 */
describe('media', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();
  const originalDefaultPlatformVersion = '1.6.0';
  const minVersionForCaptureImage = '1.7.0';
  const scanBarCodeAPISupportVersion = '1.9.0';
  const videoAndImageMediaAPISupportVersion = '2.0.2';

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

  it('should not allow captureImage calls before initialization', () => {
    return expect(media.captureImage()).rejects.toThrowError('The library has not yet been initialized');
  });
  it('captureImage call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    return expect(media.captureImage()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });
  it('should not allow captureImage calls for authentication frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    return expect(media.captureImage()).rejects.toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow captureImage calls for remove frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    return expect(media.captureImage()).rejects.toThrowError("This call is not allowed in the 'remove' context");
  });
  it('should not allow captureImage calls for settings frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    return expect(media.captureImage()).rejects.toThrowError("This call is not allowed in the 'settings' context");
  });
  it('should not allow captureImage calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content);
    return expect(media.captureImage()).rejects.toEqual({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM });
  });
  it('captureImage call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    media.captureImage();
    const message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('captureImage call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    media.captureImage();
    const message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('captureImage calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    const promise = media.captureImage();

    const message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    const callbackId = message.id;
    const filesArray = [
      {
        content: 'base64encodedImage',
        format: media.FileFormat.Base64,
        mimeType: 'image/png',
        size: 300,
      } as media.File,
    ];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, filesArray],
      },
    } as DOMMessageEvent);

    const files = await promise;
    expect(files.length).toBe(1);
    const file = files[0];
    expect(file).not.toBeNull();
    expect(file.format).toBe(media.FileFormat.Base64);
    expect(file.mimeType).toBe('image/png');
    expect(file.content).not.toBeNull();
    expect(file.size).not.toBeNull();
    expect(typeof file.size === 'number').toBeTruthy();
  });
  it('captureImage calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
    const promise = media.captureImage();

    const message = mobilePlatformMock.findMessageByFunc('captureImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
      },
    } as DOMMessageEvent);

    return expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
  });

  /**
   * Select Media tests
   */
  it('should not allow selectMedia calls with null mediaInputs', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    return expect(media.selectMedia(null)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('should not allow selectMedia calls with invalid mediaInputs', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 11,
    };
    return expect(media.selectMedia(mediaInputs)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('selectMedia call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    return expect(media.selectMedia(mediaInputs)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });

  it('selectMedia call for mediaType = 3 in mediaAPISupportVersion of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.VideoAndImage,
      maxMediaCount: 10,
    };
    return expect(media.selectMedia(mediaInputs)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });

  it('selectMedia call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs);
    const message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectMedia call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    media.selectMedia(mediaInputs);
    const message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectMedia calls with successful result for mediaType = 1', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    const promise = media.selectMedia(mediaInputs);

    const message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    const filesArray = [
      {
        content: 'base64encodedImage',
        preview: null,
        format: media.FileFormat.ID,
        mimeType: 'image/jpeg',
        size: 300,
      } as media.Media,
    ];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, filesArray],
      },
    } as DOMMessageEvent);

    const mediaAttachments = await promise;
    expect(mediaAttachments.length).toBe(1);
    const mediaAttachment = mediaAttachments[0];
    expect(mediaAttachment).not.toBeNull();
    expect(mediaAttachment.format).toBe(media.FileFormat.ID);
    expect(mediaAttachment.mimeType).toBe('image/jpeg');
    expect(mediaAttachment.content).not.toBeNull();
    expect(mediaAttachment.size).not.toBeNull();
    expect(typeof mediaAttachment.size === 'number').toBeTruthy();
    expect(mediaAttachment.getMedia).toBeDefined();
  });

  it('selectMedia calls with successful result for mediaType = 3', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios);
    mobilePlatformMock.setClientSupportedSDKVersion(videoAndImageMediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.VideoAndImage,
      maxMediaCount: 10,
    };
    const promise = media.selectMedia(mediaInputs);

    const message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    const filesArray = [
      {
        content: 'base64encodedImage',
        preview: null,
        format: media.FileFormat.ID,
        mimeType: 'video/mp4',
        size: 300,
      } as media.Media,
    ];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, filesArray],
      },
    } as DOMMessageEvent);

    const mediaAttachments = await promise;
    expect(mediaAttachments.length).toBe(1);
    const mediaAttachment = mediaAttachments[0];
    expect(mediaAttachment).not.toBeNull();
    expect(mediaAttachment.format).toBe(media.FileFormat.ID);
    expect(mediaAttachment.mimeType).toBe('video/mp4');
    expect(mediaAttachment.content).not.toBeNull();
    expect(mediaAttachment.size).not.toBeNull();
    expect(typeof mediaAttachment.size === 'number').toBeTruthy();
    expect(mediaAttachment.getMedia).toBeDefined();
  });

  it('selectMedia calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaInputs: media.MediaInputs = {
      mediaType: media.MediaType.Image,
      maxMediaCount: 10,
    };
    const promise = media.selectMedia(mediaInputs);

    const message = mobilePlatformMock.findMessageByFunc('selectMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.SIZE_EXCEEDED }],
      },
    } as DOMMessageEvent);

    return expect(promise).rejects.toEqual({ errorCode: ErrorCode.SIZE_EXCEEDED });
  });

  /**
   * Get Media tests
   */
  it('should not allow getMedia calls with invalid media mimetype', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = '1234567';
    mediaOutput.mimeType = null;
    mediaOutput.format = media.FileFormat.ID;
    return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('should not allow getMedia calls with invalid media content', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = null;
    mediaOutput.mimeType = 'image/jpeg';
    mediaOutput.format = media.FileFormat.ID;
    return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('should not allow getMedia calls with invalid media file format', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = '1234567';
    mediaOutput.mimeType = 'image/jpeg';
    mediaOutput.format = media.FileFormat.Base64;
    return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('getMedia call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = '1234567';
    mediaOutput.mimeType = 'image/jpeg';
    mediaOutput.format = media.FileFormat.ID;
    return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });

  it('getMedia call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = '1234567';
    mediaOutput.mimeType = 'image/jpeg';
    mediaOutput.format = media.FileFormat.ID;
    mediaOutput.getMedia();
    const message = mobilePlatformMock.findMessageByFunc('getMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
  });

  async function getStringContainedInBlob(blob: Blob): Promise<string> {
    let resolverMethod: (value: string | PromiseLike<string>) => void;
    let rejectionMethod: (reason?: any) => void;
    const blobReadingPromise: Promise<string> = new Promise<string>((resolve, reject) => {
      resolverMethod = resolve;
      rejectionMethod = reject;
    });

    const blobReader = new FileReader();
    blobReader.onloadend = (): void => {
      resolverMethod(String.fromCharCode(...new Uint8Array(blobReader.result as ArrayBuffer)));
    };
    blobReader.onerror = (): void => {
      rejectionMethod(blobReader.error);
    };

    blobReader.readAsArrayBuffer(blob);

    return blobReadingPromise;
  }

  async function validateGetMediaMessageAndResults(
    supportedSDKVersion: string,
    expectedNumberOfParametersInGetMediaMessage: number,
    respondToMessages: (message: MessageRequest, mediaResults: media.MediaResult[]) => void,
  ): Promise<void> {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(supportedSDKVersion);

    const stringMediaData = 'the media data';
    const firstMediaResult: media.MediaResult = {
      error: undefined,
      mediaChunk: {
        chunk: btoa(stringMediaData),
        chunkSequence: 1,
      },
    };
    const secondMediaResult: media.MediaResult = {
      error: undefined,
      mediaChunk: {
        chunk: undefined,
        chunkSequence: 0,
      },
    };

    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = '1234567';
    mediaOutput.mimeType = 'image/jpeg';
    mediaOutput.format = media.FileFormat.ID;
    const getMediaPromise: Promise<Blob> = mediaOutput.getMedia();

    const message = mobilePlatformMock.findMessageByFunc('getMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(expectedNumberOfParametersInGetMediaMessage);

    respondToMessages(message, [firstMediaResult, secondMediaResult]);

    const blobContents: string = await getStringContainedInBlob(await getMediaPromise);
    expect(blobContents).toEqual(stringMediaData);
  }

  it('getMedia using callback method returns successful result with expected data', async () => {
    validateGetMediaMessageAndResults(
      getMediaCallbackSupportVersion,
      1,
      (message: MessageRequest, mediaResults: media.MediaResult[]) => {
        const callbackId = message.id;

        for (let i = 0; i < mediaResults.length; ++i) {
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [mediaResults[i]],
              isPartialResponse: i < mediaResults.length - 1,
            },
          } as DOMMessageEvent);
        }
      },
    );
  });

  it('getMedia using register handler method returns successful result with expected data', async () => {
    validateGetMediaMessageAndResults(
      mediaAPISupportVersion,
      2,
      (_message: MessageRequest, mediaResults: media.MediaResult[]) => {
        const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
        const getMediaHandlerName = handlerRegistrationMessage.args[0];

        for (let i = 0; i < mediaResults.length; ++i) {
          callHandler(getMediaHandlerName, [JSON.stringify(mediaResults[i])]);
        }
      },
    );
  });

  it('getMedia calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const mediaOutput: media.Media = new media.Media();
    mediaOutput.content = '1234567';
    mediaOutput.mimeType = 'image/jpeg';
    mediaOutput.format = media.FileFormat.ID;
    const promise = mediaOutput.getMedia();

    const message = mobilePlatformMock.findMessageByFunc('getMedia');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, undefined],
      },
    } as DOMMessageEvent);
    return expect(promise).rejects;
  });

  /**
   * View Images
   */
  it('should not allow viewImages calls with null imageuris', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    return expect(media.viewImages(null)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('should not allow viewImages calls with invalid imageuris', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const uris: media.ImageUri[] = [];
    return expect(media.viewImages(uris)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('viewImages call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    const uris: media.ImageUri[] = [];
    const uri: media.ImageUri = {
      value: 'https://www.w3schools.com/images/picture.jpg',
      type: media.ImageUriType.URL,
    };
    uris.push(uri);
    return expect(media.viewImages(uris)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });

  it('viewImages call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const uris: media.ImageUri[] = [];
    const uri: media.ImageUri = {
      value: 'https://www.w3schools.com/images/picture.jpg',
      type: media.ImageUriType.URL,
    };
    uris.push(uri);
    media.viewImages(uris);
    const message = mobilePlatformMock.findMessageByFunc('viewImages');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('viewImages call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const uris: media.ImageUri[] = [];
    const uri: media.ImageUri = {
      value: 'https://www.w3schools.com/images/picture.jpg',
      type: media.ImageUriType.URL,
    };
    uris.push(uri);
    media.viewImages(uris);
    const message = mobilePlatformMock.findMessageByFunc('viewImages');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('viewImages calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
    const uris: media.ImageUri[] = [];
    const uri: media.ImageUri = {
      value: '1234567',
      type: media.ImageUriType.ID,
    };
    uris.push(uri);
    const promise = media.viewImages(uris);

    const message = mobilePlatformMock.findMessageByFunc('viewImages');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.FILE_NOT_FOUND }],
      },
    } as DOMMessageEvent);
    return expect(promise).rejects.toEqual({ errorCode: ErrorCode.FILE_NOT_FOUND });
  });

  /**
   * ScanBarCode API tests
   */
  it('should not allow scanBarCode calls before initialization', () => {
    return expect(media.scanBarCode()).rejects.toThrowError('The library has not yet been initialized');
  });

  it('scanBarCode call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    return expect(media.scanBarCode()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });

  it('should not allow scanBarCode calls for authentication frame context', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    return expect(media.scanBarCode(null)).rejects.toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });

  it('scanBarCode call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    media.scanBarCode(null);
    const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('scanBarCode call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    media.scanBarCode(null);
    const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('scanBarCode calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    const promise = media.scanBarCode();

    const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    const response = 'decodedText';
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, response],
      },
    } as DOMMessageEvent);

    return expect(promise).resolves.toBe('decodedText');
  });

  it('scanBarCode with optional barcode config calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    const barCodeConfig: media.BarCodeConfig = {
      timeOutIntervalInSec: 40,
    };
    const promise = media.scanBarCode(barCodeConfig);

    const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    const response = 'decodedText';
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, response],
      },
    } as DOMMessageEvent);

    return expect(promise).resolves.toBe('decodedText');
  });

  it('scanBarCode calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    const promise = media.scanBarCode();

    const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.OPERATION_TIMED_OUT }],
      },
    } as DOMMessageEvent);

    return expect(promise).rejects.toEqual({ errorCode: ErrorCode.OPERATION_TIMED_OUT });
  });

  it('should not allow scanBarCode calls with invalid timeOutIntervalInSec', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    const barCodeConfig = {
      timeOutIntervalInSec: 0,
    };
    return expect(media.scanBarCode(barCodeConfig)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
  });

  it('should allow scanBarCode calls when timeOutIntervalInSec is not passed in config params', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
    const barCodeConfig: media.BarCodeConfig = {};
    return expect(media.scanBarCode(barCodeConfig)).resolves;
  });

  it('should not allow scanBarCode calls in desktop', async () => {
    await desktopPlatformMock.initializeWithContext(FrameContexts.content, HostClientType.desktop);
    return expect(media.scanBarCode()).rejects.toEqual({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM });
  });
});
