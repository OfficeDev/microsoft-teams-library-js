import { app } from '../../src/public/app';
import { ErrorCode } from '../../src/public/interfaces';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { sharing } from '../../src/public/sharing';
import { Utils } from '../utils';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';

describe('sharing_v1', () => {
  const utils = new Utils();
  const allowedContexts = [
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.task,
    FrameContexts.stage,
    FrameContexts.meetingStage,
  ];

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
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('Testing sharing.shareWebContent function v1', () => {
    Object.keys(FrameContexts)
      .map((key) => FrameContexts[key])
      .forEach((frameContext) => {
        if (!allowedContexts.includes(frameContext)) {
          it(`sharing.shareWebContent should not allow calls from ${frameContext} context`, async () => {
            await utils.initializeWithContext(frameContext);
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
            expect(() => sharing.shareWebContent(shareRequest)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        } else {
          it(`sharing.shareWebContent should throw error when sharing is not supported. context: ${frameContext}`, async () => {
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
            await utils.initializeWithContext(frameContext);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(sharing.shareWebContent(shareRequest)).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`sharing.shareWebContent should successfully call the callback function when given the share web content in correct format when initialized with ${frameContext} context- success scenario`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
              const callback = () => {
                done();
              };
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
          });

          it(`sharing.shareWebContent should throw a SdkError when the shared content is missing when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              const shareRequest = { content: undefined };
              const error = {
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content is missing',
              };

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when content array is empty when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              const shareRequest = { content: [] };
              const error = {
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content is missing',
              };

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when content type is missing when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
                content: [
                  {
                    url: 'https://www.microsoft.com',
                    preview: true,
                    message: 'Test',
                  },
                ],
              } as any as sharing.IShareRequest<sharing.IURLContent>;
              const error = {
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content type cannot be undefined',
              };

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when content items are of mixed types when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
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

              sharing.shareWebContent(shareRequest as any, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when url is missing in URL content type when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
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

              sharing.shareWebContent(shareRequest as any, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when content is an unsupported type when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
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
              sharing.shareWebContent(shareRequest as any, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when other errors occur when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
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

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).not.toBeNull();
              expect(shareMessage.args[0]).toEqual(shareRequest);
              utils.respondToMessage(shareMessage, error);
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when request is null when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              const shareRequest: sharing.IShareRequest<sharing.IURLContent> = null;
              const error = {
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content is missing',
              };

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when request is undefined when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              const shareRequest: sharing.IShareRequest<sharing.IURLContent> = undefined;
              const error = {
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content is missing',
              };

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });

          it(`sharing.shareWebContent should throw a SdkError when request is invalid object when initialized with ${frameContext} context`, (done) => {
            utils.initializeWithContext(frameContext).then(() => {
              const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
                first: 1,
                second: 2,
              } as any as sharing.IShareRequest<sharing.IURLContent>;

              const error = {
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content is missing',
              };

              sharing.shareWebContent(shareRequest, (response) => {
                expect(response).toEqual(error);
                done();
              });
              const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
              expect(shareMessage).toBeNull();
            });
          });
        }
      });
  });
});

describe('sharing_v2', () => {
  const utils = new Utils();
  const allowedContexts = [
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.task,
    FrameContexts.stage,
    FrameContexts.meetingStage,
  ];

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

  describe('Testing sharing.shareWebContent v2 function', () => {
    Object.keys(FrameContexts)
      .map((key) => FrameContexts[key])
      .forEach((frameContext) => {
        if (!allowedContexts.includes(frameContext)) {
          it(`sharing.shareWebContent should not allow calls from ${frameContext} context`, async () => {
            await utils.initializeWithContext(frameContext);
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
            expect(() => sharing.shareWebContent(shareRequest)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        } else {
          it(`sharing.shareWebContent should successfully resolves when given the share web content in correct format when initialized with ${frameContext} context - success scenario`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when content is missing when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when content array is empty when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when content type is missing when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when content items are of mixed types when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when url is missing in URL content type when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when content is an unsupported type when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when other errors occur when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when request is null when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when request is undefined when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
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

          it(`sharing.shareWebContent should throw a SdkError when request is invalid object when initialized with ${frameContext} context`, async () => {
            await utils.initializeWithContext(FrameContexts.content);
            const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
              first: 1,
              second: 2,
            } as any as sharing.IShareRequest<sharing.IURLContent>;
            const error = {
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'Shared content is missing',
            };
            const promise = sharing.shareWebContent(shareRequest);
            const shareMessage = utils.findMessageByFunc(sharing.SharingAPIMessages.shareWebContent);
            expect(shareMessage).toBeNull();
            await expect(promise).rejects.toEqual(error);
          });
        }
      });
  });
});

describe('Testing sharing.isSupported function', () => {
  const utils = new Utils();
  it('sharing.isSupported should return false if the runtime says sharing is not supported', () => {
    utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
    expect(sharing.isSupported()).not.toBeTruthy();
  });

  it('sharing.isSupported should return true if the runtime says sharing is supported', () => {
    utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
    expect(sharing.isSupported()).toBeTruthy();
  });
});
