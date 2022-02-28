import { app } from '../../src/public/app';
import { ErrorCode } from '../../src/public/interfaces';
import { sharing } from '../../src/public/sharing';
import { Utils } from '../utils';

describe('sharing_v1', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });
  describe('isSupported', () => {
    it('returns true if sharing is supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
      expect(sharing.isSupported()).toBeTruthy();
    });

    it('returns false if sharing is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: undefined } });

      expect(sharing.isSupported()).toBeFalsy();
    });
  });

  it('should successfully call the callback function when given the share web content in correct format - success scenario', async () => {
    await utils.initializeWithContext('content');
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const callback = jest.fn();
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
      content: [
        {
          type: 'URL',
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
      ],
    };

    sharing.shareWebContent(shareRequest, callback);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);

    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args.length).toBe(1);
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage);
  });

  it('should throw a SdkError when the shared content is missing', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = { content: undefined };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when content array is empty', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = { content: [] };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when content type is missing', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = ({
      content: [
        {
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
      ],
    } as unknown) as sharing.IShareRequest<sharing.IURLContent>;
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content type cannot be undefined',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when content items are of mixed types', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          type: 'URL',
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
        {
          type: 'text',
          message: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content must be of the same type',
    };

    sharing.shareWebContent(shareRequest as any, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when url is missing in URL content type', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          type: 'URL',
          message: 'test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'URLs are required for URL content types',
    };

    sharing.shareWebContent(shareRequest as never, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when content is an unsupported type', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          type: 'image',
          src: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Content type is unsupported',
    };
    sharing.shareWebContent(shareRequest as any, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when other errors occur', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
      content: [
        {
          type: 'URL',
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
      message: 'Feature is not supported.',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage, error);
  });

  it('should throw a SdkError when request is null', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = null;
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when request is undefined', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = undefined;
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });

  it('should throw a SdkError when request is invalid object', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = ({
      first: 1,
      second: 2,
    } as unknown) as sharing.IShareRequest<sharing.IURLContent>;

    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    sharing.shareWebContent(shareRequest, response => {
      expect(response).toEqual(error);
    });
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
  });
});

describe('sharing_v2', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  it('should successfully resolves when given the share web content in correct format - success scenario', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
      content: [
        {
          type: 'URL',
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
      ],
    };
    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);

    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args.length).toBe(1);
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage);
    await expect(promise).resolves.not.toThrowError();
  });

  it('should throw a SdkError when content is missing', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = { content: undefined };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when content array is empty', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = { content: [] };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when content type is missing', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content type cannot be undefined',
    };

    const promise = sharing.shareWebContent(shareRequest as any);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when content items are of mixed types', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          type: 'URL',
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
        {
          type: 'text',
          message: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content must be of the same type',
    };

    const promise = sharing.shareWebContent(shareRequest as any);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when url is missing in URL content type', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          type: 'URL',
          message: 'test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'URLs are required for URL content types',
    };

    const promise = sharing.shareWebContent(shareRequest as any);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when content is an unsupported type', async () => {
    await utils.initializeWithContext('content');
    const shareRequest = {
      content: [
        {
          type: 'image',
          src: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Content type is unsupported',
    };

    const promise = sharing.shareWebContent(shareRequest as any);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when other errors occur', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
      content: [
        {
          type: 'URL',
          url: 'https://www.microsoft.com',
          preview: true,
          message: 'Test',
        },
      ],
    };
    const error = {
      errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
      message: 'Feature is not supported.',
    };

    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage, error);
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when request is null', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = null;
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when request is undefined', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = undefined;
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };

    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });

  it('should throw a SdkError when request is invalid object', async () => {
    await utils.initializeWithContext('content');
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = ({
      first: 1,
      second: 2,
    } as any) as sharing.IShareRequest<sharing.IURLContent>;
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Shared content is missing',
    };
    const promise = sharing.shareWebContent(shareRequest);
    const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    await expect(promise).rejects.toEqual(error);
  });
});
