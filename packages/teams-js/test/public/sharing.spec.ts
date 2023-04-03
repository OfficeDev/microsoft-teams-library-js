import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { compareSDKVersions } from '../../src/internal/utils';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from '../../src/public/constants';
import { ErrorCode } from '../../src/public/interfaces';
import { generateBackCompatRuntimeConfig } from '../../src/public/runtime';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { sharing } from '../../src/public/sharing';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

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
              utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
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
              utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
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
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('Testing sharing.isSupported function', () => {
    const utils = new Utils();
    it('sharing.isSupported should return false if the runtime says sharing is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(sharing.isSupported()).not.toBeTruthy();
    });

    it('sharing.isSupported should return true if the runtime says sharing is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
      expect(sharing.isSupported()).toBeTruthy();
    });

    it('sharing.isSupported should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => sharing.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  const testVersions = ['1.8.0', '1.9.0', '2.0.2'];
  const minDesktopAndWebVersionForSharing = '2.0.0';
  const supportedClientTypes = [HostClientType.web, HostClientType.desktop];
  describe('Testing sharing.isSupported() on different platforms', () => {
    Object.values(HostClientType).forEach((clientType) => {
      if (supportedClientTypes.some((supportedClientTypes) => supportedClientTypes == clientType)) {
        Object.values(testVersions).forEach((version) => {
          if (compareSDKVersions(version, minDesktopAndWebVersionForSharing) >= 0) {
            it(`sharing.isSupported() should return true for web and desktop when version is greater than supported version ${minDesktopAndWebVersionForSharing}}`, async () => {
              await utils.initializeWithContext(FrameContexts.content, clientType);
              utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
              expect(sharing.isSupported()).toBeTruthy();
            });
          } else {
            it(`sharing.isSupported() should return false for web and desktop when version is lower than supported version ${minDesktopAndWebVersionForSharing}}`, async () => {
              await utils.initializeWithContext(FrameContexts.content, clientType);
              utils.setRuntimeConfig(generateBackCompatRuntimeConfig(version));
              expect(sharing.isSupported()).toBeFalsy();
            });
          }
        });
      } else {
        it(`sharing.isSupported() should return false for platforms other than desktop and web, regardless version`, async () => {
          await utils.initializeWithContext(FrameContexts.content, clientType);
          expect(sharing.isSupported()).toBeFalsy();
        });
      }
    });
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
            utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
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
            utils.setRuntimeConfig({ apiVersion: 1, supports: { sharing: {} } });
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
