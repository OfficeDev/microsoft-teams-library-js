import { getImage, ErrorCode, File, FileFormat } from '../../src/public/media' 
import { FramelessPostMocks } from '../framelessPostMocks';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { frameContexts } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';

/**
 * Test cases for device APIs
 */
describe('media', () => {
  const utils = new FramelessPostMocks();
  
  beforeEach(() => {
    utils.messages = [];

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  let emptyCallback = () => {};

  it('should not allow getImage calls before initialization', () => {
    expect(() => getImage(emptyCallback)).toThrowError(
      'The library has not yet been initialized',
    );
  });
  it('should not allow getImage calls for authentication frame context', () => {
    utils.initializeWithContext(frameContexts.authentication);
    expect(() => getImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });
  it('should not allow getImage calls for remove frame context', () => {
    utils.initializeWithContext(frameContexts.remove);
    expect(() => getImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'remove' context",
    );
  });
  it('should not allow getImage calls for settings frame context', () => {
    utils.initializeWithContext(frameContexts.settings);
    expect(() => getImage(emptyCallback)).toThrowError(
      "This call is not allowed in the 'settings' context",
    );
  });
  it('should not allow getImage calls with null callback', () => {
    expect(() => getImage(null)).toThrowError(
      '[getImage] Callback cannot be null',
    );
  });
  it('should not allow getImage calls with null callback after init context', () => {
    utils.initializeWithContext(frameContexts.content);
    expect(() => getImage(null)).toThrowError(
      '[getImage] Callback cannot be null',
    );
  });
  it('getImage call in task frameContext workst', () => {
    utils.initializeWithContext(frameContexts.task);
    getImage(emptyCallback);
    let message = utils.findMessageByFunc('getImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('getImage call in content frameContext works', () => {
    utils.initializeWithContext(frameContexts.content);
    getImage(emptyCallback);
    let message = utils.findMessageByFunc('getImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);
  });
  it('getImage calls with successful result', () => {
    utils.initializeWithContext(frameContexts.content);
    let files, error;
    getImage((e: ErrorCode, f: File[]) => {
      error = e;
      files = f;
    });

    let message = utils.findMessageByFunc('getImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    let callbackId = message.id;
    let filesArray = [{
        content: 'base64encodedImage',
        format: FileFormat.Base64,
        mimeType: 'image/png',
        size: 300,
      } as File];
    utils.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, filesArray]
      }
    } as DOMMessageEvent)

    expect(files.length).toBe(1);
    let file = files[0];
    expect(file).not.toBeNull();
    expect(file.format).toBe(FileFormat.Base64);
    expect(file.mimeType).toBe('image/png');
    expect(file.content).not.toBeNull();
    expect(file.size).not.toBeNull();
    expect(typeof file.size === 'number').toBeTruthy();
  });
  it('getImage calls with error', () => {
    utils.initializeWithContext(frameContexts.content);
    let files, error;
    getImage((e: ErrorCode, f: File[]) => {
      error = e;
      files = f;
    });

    let message = utils.findMessageByFunc('getImage');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(0);

    let callbackId = message.id;
    utils.respondToMessage({
      data: {
        id: callbackId,
        args: [1]
      }
    } as DOMMessageEvent)

    expect(files).toBeFalsy();
    expect(error).toBe(1);
  });
});