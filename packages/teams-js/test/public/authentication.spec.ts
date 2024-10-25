import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import * as handlers from '../../src/internal/handlers';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import * as internalUtils from '../../src/internal/utils';
import { ErrorCode, FrameContexts, HostClientType, SdkError } from '../../src/public';
import * as app from '../../src/public/app/app';
import * as authentication from '../../src/public/authentication';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('Testing authentication capability', () => {
  const errorMessage = 'Sample Error Message';
  const mockResult = 'someResult';
  const sdkError: SdkError = {
    errorCode: ErrorCode.INTERNAL_ERROR,
    message: errorMessage,
  };
  const mockResource = 'https://someresource/';
  const mockClaim = 'some_claim';
  const mockUser: authentication.UserProfile = {
    aud: 'test_aud',
    amr: ['test_amr'],
    iat: 0,
    iss: 'test_iss',
    family_name: 'test_family_name',
    given_name: 'test_given_name',
    unique_name: 'test_unique_name',
    oid: 'test_oid',
    sub: 'test_sub',
    tid: 'test_tid',
    exp: 0,
    nbf: 0,
    upn: 'test_upn',
    ver: 'test_ver',
  };
  const mockUserWithDataResidency = {
    ...mockUser,
    dataResidency: authentication.DataResidency.Public,
  };
  const allowedContexts = [
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.settings,
    FrameContexts.remove,
    FrameContexts.task,
    FrameContexts.stage,
    FrameContexts.meetingStage,
  ];

  const allowedHostClientType = [
    HostClientType.desktop,
    HostClientType.android,
    HostClientType.ios,
    HostClientType.ipados,
    HostClientType.macos,
    HostClientType.rigel,
    HostClientType.teamsRoomsWindows,
    HostClientType.teamsRoomsAndroid,
    HostClientType.teamsPhones,
    HostClientType.teamsDisplays,
    HostClientType.surfaceHub,
  ];
  describe('FRAMED - authentication tests', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
      // Set a mock window for testing
      app._initialize(utils.mockWindow);
    });
    afterEach(() => {
      app._uninitialize();
    });

    describe('Testing authentication.initialize function', () => {
      it('authentication.initialize should successfully register authentication.authenticate.success/failure handler', async () => {
        const spy = jest.spyOn(handlers, 'registerHandler');
        authentication.initialize();
        expect(spy).toBeCalledTimes(2);
      });
    });

    describe('Testing authentication.registerAuthenticationHandlers function', () => {
      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
          it(`authentication.registerAuthenticationHandlers should successfully pop up the auth window when authenticate called with authenticationParams for connectors with ${context} context`, async () => {
            await utils.initializeWithContext(context);
            let windowOpenCalled = false;
            jest.spyOn(utils.mockWindow, 'open').mockImplementation((url, name, specsInput): Window => {
              const specs: string = specsInput as string;
              expect(url).toEqual('https://someurl/');
              expect(name).toEqual('_blank');
              expect(specs.indexOf('width=100')).not.toBe(-1);
              expect(specs.indexOf('height=200')).not.toBe(-1);
              windowOpenCalled = true;
              return utils.childWindow as Window;
            });

            const authenticationParams = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            authentication.registerAuthenticationHandlers(authenticationParams);
            authentication.authenticate();
            expect(windowOpenCalled).toBe(true);
          });
        }
      });
    });

    describe('Testing authentication.authenticate function', () => {
      beforeEach(() => {
        // For *almost* all of these tests we want setInterval to be a no-op, so we set it to immediately return 0
        utils.mockWindow.setInterval = (handler: Function, timeout: number): number => 0;
      });
      afterEach(() => {
        // After each test we reset setInterval to its normal value
        utils.mockWindow.setInterval = (handler: Function, timeout: number): number => setInterval(handler, timeout);
      });
      it('authentication.authenticate should not allow calls before initialization', () => {
        const authenticationParams: authentication.AuthenticatePopUpParameters = {
          url: 'https://someurl/',
          width: 100,
          height: 200,
        };
        expect(() => authentication.authenticate(authenticationParams)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`authentication.authenticate should allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            const promise = authentication.authenticate(authenticationParams);

            utils.processMessage({
              origin: utils.tabOrigin,
              source: utils.childWindow,
              data: {
                id: 0,
                func: 'authentication.authenticate.success',
                args: [mockResult],
              },
            } as MessageEvent);

            await expect(promise).resolves.toEqual(mockResult);
          });

          it(`authentication.authenticate should successfully pop up the auth window when initialized with ${context} context`, async () => {
            expect.assertions(5);
            await utils.initializeWithContext(context);

            let windowOpenCalled = false;
            jest.spyOn(utils.mockWindow, 'open').mockImplementation((url, name, specsInput): Window => {
              const specs: string = specsInput as string;
              expect(url).toEqual('https://someurl/');
              expect(name).toEqual('_blank');
              expect(specs.indexOf('width=100')).not.toBe(-1);
              expect(specs.indexOf('height=200')).not.toBe(-1);
              windowOpenCalled = true;
              return utils.childWindow as Window;
            });

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            authentication.authenticate(authenticationParams);
            expect(windowOpenCalled).toBe(true);
          });

          it(`authentication.authenticate should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called in legacy flow from ${context} context`, async () => {
            expect.assertions(5);
            await utils.initializeWithContext(context);

            let windowOpenCalled = false;
            jest.spyOn(utils.mockWindow, 'open').mockImplementation((url, name, specsInput): Window => {
              const specs: string = specsInput as string;
              expect(url).toEqual('https://someurl/');
              expect(name).toEqual('_blank');
              expect(specs.indexOf('width=100')).not.toBe(-1);
              expect(specs.indexOf('height=200')).not.toBe(-1);
              windowOpenCalled = true;
              return utils.childWindow as Window;
            });
            const authenticationParams = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
              successCallback: () => {
                expect(true).toBe(false);
              },
              failureCallback: (reason: string) => {
                expect(reason).toEqual('CancelledByUser');
              },
            };
            authentication.authenticate(authenticationParams);
            expect(windowOpenCalled).toBe(true);

            utils.childWindow.closed = true;
          });

          it(`authentication.authenticate should successfully handle auth success in legacy flow from ${context} context`, (done) => {
            utils.initializeWithContext(context).then(() => {
              const authenticationParams = {
                url: 'https://someurl/',
                width: 100,
                height: 200,
                successCallback: (result: string) => {
                  expect(result).toEqual(mockResult);
                  done();
                },
                failureCallback: () => {
                  done();
                },
              };
              authentication.authenticate(authenticationParams);

              utils.processMessage({
                origin: utils.tabOrigin,
                source: utils.childWindow,
                data: {
                  id: 0,
                  func: 'authentication.authenticate.success',
                  args: [mockResult],
                },
              } as MessageEvent);
            });
          });

          it(`authentication.authenticate should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called from ${context} context`, async () => {
            // This test actually needs the interval to work so that the window "closes"
            utils.mockWindow.setInterval = (handler: Function, timeout: number): number => setInterval(handler, 0);
            expect.assertions(6);
            await utils.initializeWithContext(context);

            let windowOpenCalled = false;
            jest.spyOn(utils.mockWindow, 'open').mockImplementation((url, name, specsInput): Window => {
              const specs: string = specsInput as string;
              expect(url).toEqual('https://someurl/');
              expect(name).toEqual('_blank');
              expect(specs.indexOf('width=100')).not.toBe(-1);
              expect(specs.indexOf('height=200')).not.toBe(-1);
              windowOpenCalled = true;
              return utils.childWindow as Window;
            });

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            const promise = authentication.authenticate(authenticationParams);
            expect(windowOpenCalled).toBe(true);

            utils.childWindow.closed = true;
            await expect(promise).rejects.toThrowError('CancelledByUser');
          });

          it(`authentication.authenticate should successfully handle auth success from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            const authenticationParams = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            const promise = authentication.authenticate(authenticationParams);

            utils.processMessage({
              origin: utils.tabOrigin,
              source: utils.childWindow,
              data: {
                id: 0,
                func: 'authentication.authenticate.success',
                args: [mockResult],
              },
            } as MessageEvent);

            await expect(promise).resolves.toEqual(mockResult);
          });

          it(`authentication.authenticate should successfully handle auth success from ${context} context when passed a valid encoded URL`, async () => {
            await utils.initializeWithContext(context);

            jest.spyOn(internalUtils, 'fullyQualifyUrlString').mockImplementationOnce((urlString): URL => {
              return new URL('https://localhost/' + urlString);
            });

            const authenticationParams = {
              url: 'hello%20world',
              width: 100,
              height: 200,
            };
            const promise = authentication.authenticate(authenticationParams);

            utils.processMessage({
              origin: utils.tabOrigin,
              source: utils.childWindow,
              data: {
                id: 0,
                func: 'authentication.authenticate.success',
                args: [mockResult],
              },
            } as MessageEvent);

            await expect(promise).resolves.toEqual(mockResult);
          });

          it(`authentication.authenticate should handle auth failure in legacy flow from ${context} context`, (done) => {
            utils.initializeWithContext(context).then(() => {
              const authenticationParams = {
                url: 'https://someurl/',
                width: 100,
                height: 200,
                successCallback: () => {
                  done();
                },
                failureCallback: (reason: string) => {
                  expect(reason).toEqual(errorMessage);
                  done();
                },
              };
              authentication.authenticate(authenticationParams);

              utils.processMessage({
                origin: utils.tabOrigin,
                source: utils.childWindow,
                data: {
                  id: 0,
                  func: 'authentication.authenticate.failure',
                  args: [errorMessage],
                },
              } as MessageEvent);
            });
          });

          it(`authentication.authenticate should handle auth failure from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            const authenticationParams = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            const promise = authentication.authenticate(authenticationParams);

            utils.processMessage({
              origin: utils.tabOrigin,
              source: utils.childWindow,
              data: {
                id: 0,
                func: 'authentication.authenticate.failure',
                args: [errorMessage],
              },
            } as MessageEvent);

            await expect(promise).rejects.toThrowError(errorMessage);
          });
          it(`authentication.authenticate should successfully send authenticate message to non-web client in legacy flow from ${context} context`, () => {
            return utils.initializeWithContext(context, HostClientType.desktop).then(() => {
              const authenticationParams = {
                url: 'https://someUrl',
                width: 100,
                height: 200,
                isExternal: true,
              };

              authentication.authenticate(authenticationParams);
              const message = utils.findMessageByFunc('authentication.authenticate');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(4);
              expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
              expect(message.args[1]).toBe(authenticationParams.width);
              expect(message.args[2]).toBe(authenticationParams.height);
              expect(message.args[3]).toBe(authenticationParams.isExternal);
            });
          });

          it(`authentication.authenticate should throw an error if a URL that isn't https is passed in`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.desktop);

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'http://someurl/',
              width: 100,
              height: 200,
            };

            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Url should be a valid https url');
          });

          it(`authentication.authenticate should throw an error if a URL that is more than 2048 characters long is passed in`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.desktop);

            let testUrl: string = 'https://';
            for (let i: number = 0; i < 2040; i++) {
              testUrl += 'a';
            }

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: testUrl,
              width: 100,
              height: 200,
            };

            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Url exceeds the maximum size of 2048 characters');
          });

          it(`authentication.authenticate should not contain script tags`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.desktop);

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: encodeURI('https://example.com?param=<script>alert("Hello, world!");</script>'),
              width: 100,
              height: 200,
            };

            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Invalid Url');
          });

          it(`authentication.authenticate it should successfully handle auth success in a non-web client in legacy flow from ${context} context`, (done) => {
            utils.initializeWithContext(context, HostClientType.desktop).then(async () => {
              const authenticationParams = {
                url: 'https://someUrl',
                width: 100,
                height: 200,
                successCallback: (result: string) => {
                  expect(result).toEqual(mockResult);
                  done();
                },
                failureCallback: () => {
                  expect(true).toBe(false);
                  done();
                },
              };
              authentication.authenticate(authenticationParams);

              expect.assertions(2);
              const message = utils.findMessageByFunc('authentication.authenticate');
              expect(message).not.toBeNull();
              await utils.respondToMessage(message, true, mockResult);
            });
          });

          it(`authentication.authenticate should successfully handle auth failure in a non-web client in legacy flow from ${context} context`, (done) => {
            expect.assertions(2);
            utils.initializeWithContext(context, HostClientType.desktop).then(async () => {
              const authenticationParams = {
                url: 'https://someUrl',
                width: 100,
                height: 200,
                successCallback: () => {
                  expect(true).toBe(false);
                  done();
                },
                failureCallback: (reason: string) => {
                  expect(reason).toEqual(errorMessage);
                  done();
                },
              };
              authentication.authenticate(authenticationParams);

              const message = utils.findMessageByFunc('authentication.authenticate');
              expect(message).not.toBeNull();

              await utils.respondToMessage(message, false, errorMessage);
            });
          });
          it(`authentication.authenticate should throw an error on web clients if a URL that isn't https is passed in`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.web);

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'http://someurl/',
              width: 100,
              height: 200,
            };

            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Url should be a valid https url');
          });
          it(`authentication.authenticate should throw an error on web clients if a URL that is too long is passed in`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.web);

            let testUrl: string = 'https://';
            for (let i: number = 0; i < 2040; i++) {
              testUrl += 'a';
            }

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: testUrl,
              width: 100,
              height: 200,
            };

            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Url exceeds the maximum size of 2048 characters');
          });
          it(`authentication.authenticate should throw an error on web clients if a URL containing script tags is passed in`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.web);

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://example.com?param=<script>alert("Hello, world!");</script>',
              width: 100,
              height: 200,
            };

            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Invalid Url');
          });
          it(`authentication.authenticate should open a client window in web client in legacy flow from ${context} context`, async () => {
            expect.assertions(5);
            await utils.initializeWithContext(context, HostClientType.web);

            let windowOpenCalled = false;
            jest.spyOn(utils.mockWindow, 'open').mockImplementation((url, name, specsInput): Window => {
              const specs: string = specsInput as string;
              expect(url).toEqual('https://someurl/');
              expect(name).toEqual('_blank');
              expect(specs.indexOf('width=100')).not.toBe(-1);
              expect(specs.indexOf('height=200')).not.toBe(-1);
              windowOpenCalled = true;
              return utils.childWindow as Window;
            });

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };
            authentication.authenticate(authenticationParams);
            expect(windowOpenCalled).toBe(true);
          });

          it(`authentication.authenticate should open a client window using an encoded URL in web client in legacy flow from ${context} context`, async () => {
            expect.assertions(5);
            await utils.initializeWithContext(context, HostClientType.web);

            jest.spyOn(internalUtils, 'fullyQualifyUrlString').mockImplementationOnce((urlString): URL => {
              return new URL('https://localhost/' + urlString);
            });

            let windowOpenCalled = false;
            jest.spyOn(utils.mockWindow, 'open').mockImplementation((url, name, specsInput): Window => {
              const specs: string = specsInput as string;
              expect(url).toEqual('https://localhost/hello%20world');
              expect(name).toEqual('_blank');
              expect(specs.indexOf('width=100')).not.toBe(-1);
              expect(specs.indexOf('height=200')).not.toBe(-1);
              windowOpenCalled = true;
              return utils.childWindow as Window;
            });

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'hello%20world',
              width: 100,
              height: 200,
            };
            authentication.authenticate(authenticationParams);
            expect(windowOpenCalled).toBe(true);
          });
        } else {
          it(`authentication.authenticate should not allow calls from ${context} context`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context);
            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://localhost/hello%20world',
              width: 100,
              height: 200,
            };

            expect(() => authentication.authenticate(authenticationParams)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing authentication.getAuthToken function', () => {
      it('authentication.getAuthToken should not allow calls before initialization', () => {
        const authTokenRequest = {
          resources: [mockResource],
          claims: [mockClaim],
          silent: false,
        };

        expect(() => authentication.getAuthToken(authTokenRequest)).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('authentication.getAuthToken should allow calls after initialization called, but before it finished', async () => {
        expect.assertions(3);

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        authentication.getAuthToken();
        let message = utils.findMessageByFunc('authentication.getAuthToken');
        expect(message).toBeNull();

        await utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('authentication.getAuthToken');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`authentication.getAuthToken should successfully return token in case of success in legacy flow from ${context} context`, (done) => {
          expect.assertions(6);
          utils.initializeWithContext(context).then(async () => {
            const authTokenRequest = {
              resources: [mockResource],
              claims: [mockClaim],
              silent: false,
              failureCallback: () => {
                done();
              },
              successCallback: (result) => {
                expect(result).toEqual('token');
                done();
              },
            };

            authentication.getAuthToken(authTokenRequest);

            const message = utils.findMessageByFunc('authentication.getAuthToken');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(4);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toEqual([mockClaim]);
            expect(message.args[2]).toEqual(false);

            await utils.respondToMessage(message, true, 'token');
          });
        });

        it(`authentication.getAuthToken should successfully return error from getAuthToken in case of failure in legacy flow from ${context} context`, (done) => {
          expect.assertions(6);
          utils.initializeWithContext(context).then(async () => {
            const authTokenRequest = {
              resources: [mockResource],
              failureCallback: (error) => {
                expect(error).toEqual(errorMessage);
                done();
              },
              successCallback: () => {
                done();
              },
            };

            authentication.getAuthToken(authTokenRequest);

            const message = utils.findMessageByFunc('authentication.getAuthToken');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(4);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toEqual(undefined);
            expect(message.args[2]).toEqual(undefined);

            await utils.respondToMessage(message, false, errorMessage);
          });
        });

        it(`authentication.getAuthToken should successfully return token in case of success from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const authTokenRequest = {
            resources: [mockResource],
            claims: [mockClaim],
            silent: false,
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual([mockClaim]);
          expect(message.args[2]).toEqual(false);

          await utils.respondToMessage(message, true, 'token');
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should successfully return token in case of success when using no authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual(undefined);
          expect(message.args[1]).toEqual(undefined);
          expect(message.args[2]).toEqual(undefined);

          await utils.respondToMessage(message, true, 'token');
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should request token for the tenant specified in the authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const authTokenRequest = {
            resources: [mockResource],
            claims: [mockClaim],
            silent: false,
            tenantId: 'tenantId',
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual([mockClaim]);
          expect(message.args[2]).toEqual(false);
          expect(message.args[3]).toEqual('tenantId');

          utils.respondToMessage(message, true, 'token');
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should return error in case of failure from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const authTokenRequest: authentication.AuthTokenRequestParameters = {
            resources: [mockResource],
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual(undefined);
          expect(message.args[2]).toEqual(undefined);

          await utils.respondToMessage(message, false, errorMessage);
          await expect(promise).rejects.toThrowError(errorMessage);
        });

        it(`authentication.getAuthToken should return error in case of failure when using no authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual(undefined);
          expect(message.args[1]).toEqual(undefined);
          expect(message.args[2]).toEqual(undefined);

          await utils.respondToMessage(message, false, errorMessage);
          await expect(promise).rejects.toThrowError(errorMessage);
        });
      });
    });

    describe('Testing authentication.getUser function', () => {
      it('authentication.getUser should not allow calls before initialization', () => {
        expect(() => authentication.getUser()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('authentication.getUser should allow calls after initialization called, but before it finished', async () => {
        expect.assertions(3);

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        authentication.getUser();
        let message = utils.findMessageByFunc('authentication.getUser');
        expect(message).toBeNull();

        await utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('authentication.getUser');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`authentication.getUser should successfully get user profile in legacy flow with ${context} context`, (done) => {
          utils.initializeWithContext(context).then(async () => {
            const successCallback = (user: authentication.UserProfile): void => {
              expect(user).toEqual(mockResult);
              done();
            };
            const failureCallback = (): void => {
              done();
            };
            const userRequest: authentication.UserRequest = {
              successCallback: successCallback,
              failureCallback: failureCallback,
            };
            authentication.getUser(userRequest);
            const message = utils.findMessageByFunc('authentication.getUser');
            expect(message).not.toBeNull();
            expect(message.id).toBe(1);
            expect(message.args[0]).toBe(undefined);
            await utils.respondToMessage(message, true, mockResult);
          });
        });

        it(`authentication.getUser should throw error in getting user profile in legacy flow with ${context} context`, (done) => {
          utils.initializeWithContext(context).then(async () => {
            const successCallback = (): void => {
              done();
            };
            const failureCallback = (reason: string): void => {
              expect(reason).toMatch(new RegExp(sdkError.message!));
              done();
            };
            const userRequest: authentication.UserRequest = {
              successCallback: successCallback,
              failureCallback: failureCallback,
            };
            authentication.getUser(userRequest);
            const message = utils.findMessageByFunc('authentication.getUser');
            expect(message).not.toBeNull();
            expect(message.id).toBe(1);
            expect(message.args[0]).toBe(undefined);
            await utils.respondToMessage(message, false, sdkError);
          });
        });

        it(`authentication.getUser should throw error in getting user profile with ${context} context`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          await utils.respondToMessage(message, false, sdkError);
          await expect(promise).rejects.toThrowError(new RegExp(sdkError.message!));
        });

        it(`authentication.getUser should successfully get user profile with ${context} context`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          await utils.respondToMessage(message, true, mockUser);
          await expect(promise).resolves.toEqual(mockUser);
        });

        it(`authentication.getUser should successfully get user profile including data residency info with ${context} context if data residency is provided by hosts`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          await utils.respondToMessage(message, true, mockUserWithDataResidency);
          await expect(promise).resolves.toEqual(mockUserWithDataResidency);
        });
      });
    });

    describe('Testing authentication.notifySuccess function', () => {
      const allowedContexts = [FrameContexts.authentication];

      it('authentication.notifySuccess should not allow calls before initialization', () => {
        expect(() => authentication.notifySuccess()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('authentication.notifySuccess should not close auth window before notify success message has been sent', async () => {
        expect.assertions(3);
        const closeWindowSpy = jest.spyOn(utils.mockWindow, 'close');

        await utils.initializeWithContext(FrameContexts.authentication);
        expect(closeWindowSpy).not.toHaveBeenCalled();

        authentication.notifySuccess();
        const message = utils.findMessageByFunc('authentication.authenticate.success');
        expect(message).not.toBeNull();

        // Wait 450ms for the close delay
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            expect(closeWindowSpy).toHaveBeenCalled();
            resolve();
          }, 450),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
          it(`authentication.notifySuccess should successfully notify auth success from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifySuccess(mockResult);
            const message = utils.findMessageByFunc('authentication.authenticate.success');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(mockResult);
          });
        } else {
          it(`authentication.notifySuccess should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => authentication.notifySuccess()).toThrow(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing authentication.notifyFailure', () => {
      const allowedContexts = [FrameContexts.authentication];
      it('authentication.notifyFailure should not allow calls before initialization', () => {
        expect(() => authentication.notifyFailure()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('should not close auth window before notify failure message has been sent', async () => {
        expect.assertions(3);
        const closeWindowSpy = jest.spyOn(utils.mockWindow, 'close');

        await utils.initializeWithContext(FrameContexts.authentication);
        expect(closeWindowSpy).not.toHaveBeenCalled();

        authentication.notifyFailure(errorMessage);
        const message = utils.findMessageByFunc('authentication.authenticate.failure');
        expect(message).not.toBeNull();

        // Wait 300ms for the close delay
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            expect(closeWindowSpy).toHaveBeenCalled();
            resolve();
          }, 350),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
          it(`authentication.notifyFailure should successfully notify auth failure ${context} context`, async () => {
            await utils.initializeWithContext('authentication');

            authentication.notifyFailure(errorMessage);

            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(errorMessage);
          });

          it(`authentication.notifyFailure should successfully notify auth failure if reason is empty from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifyFailure('');
            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe('');
          });
        } else {
          it(`authentication.notifyFailure should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => authentication.notifyFailure()).toThrow(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
  });

  describe('FRAMELESS - authentication tests', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    describe('Testing authentication.authenticate function', () => {
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`authentication.authenticate should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl/',
              width: 100,
              height: 200,
            };

            expect(() => authentication.authenticate(authenticationParams)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        } else {
          it(`authentication.authenticate should successfully ask parent window to open auth window with parameters in a non-web client from ${context} context`, async () => {
            await utils.initializeWithContext(context, HostClientType.desktop);
            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl',
              width: 100,
              height: 200,
              isExternal: true,
            };
            const promise = authentication.authenticate(authenticationParams);

            const message = utils.findMessageByFunc('authentication.authenticate');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(4);
            expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
            expect(message.args[1]).toBe(authenticationParams.width);
            expect(message.args[2]).toBe(authenticationParams.height);
            expect(message.args[3]).toBe(authenticationParams.isExternal);

            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [true, mockResult],
              },
            } as DOMMessageEvent);
            await expect(promise).resolves.toEqual(mockResult);
          });

          it(`authentication.authenticate should successfully ask parent window to open auth window with parameters including encoded url in a non-web client from ${context} context`, async () => {
            await utils.initializeWithContext(context, HostClientType.desktop);

            jest.spyOn(internalUtils, 'fullyQualifyUrlString').mockImplementationOnce((urlString): URL => {
              return new URL('https://localhost/' + urlString);
            });

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'hello%20world',
              width: 100,
              height: 200,
              isExternal: true,
            };
            const promise = authentication.authenticate(authenticationParams);

            const message = utils.findMessageByFunc('authentication.authenticate');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(4);
            expect(message.args[0]).toBe('https://localhost/hello%20world');
            expect(message.args[1]).toBe(authenticationParams.width);
            expect(message.args[2]).toBe(authenticationParams.height);
            expect(message.args[3]).toBe(authenticationParams.isExternal);

            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [true, mockResult],
              },
            } as DOMMessageEvent);
            await expect(promise).resolves.toEqual(mockResult);
          });

          it(`authentication.authenticate should throw an error on non-web platforms if non-https URL passed in`, async () => {
            await utils.initializeWithContext(context, HostClientType.desktop);
            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'http://someurl/',
              width: 100,
              height: 200,
              isExternal: true,
            };
            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Url should be a valid https url');
          });

          it(`authentication.authenticate should throw an error on non-web platforms if URL that is too long is passed in`, async () => {
            await utils.initializeWithContext(context, HostClientType.desktop);

            let testUrl: string = 'https://';

            for (let i: number = 0; i < 2040; i++) {
              testUrl += 'a';
            }

            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: testUrl,
              width: 100,
              height: 200,
              isExternal: true,
            };
            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Url exceeds the maximum size of 2048 characters');
          });

          it(`authentication.authenticate should throw an error on non-web platforms if URL containing script tags is passed in`, async () => {
            await utils.initializeWithContext(context, HostClientType.desktop);
            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://example.com?param=<script>alert("Hello, world!");</script>',
              width: 100,
              height: 200,
              isExternal: true,
            };
            const promise = authentication.authenticate(authenticationParams);
            await expect(promise).rejects.toThrowError('Invalid Url');
          });

          it(`authentication.authenticate should handle auth failure with parameters in a non-web client from ${context} context`, async () => {
            await utils.initializeWithContext(context, HostClientType.desktop);
            const authenticationParams: authentication.AuthenticatePopUpParameters = {
              url: 'https://someurl',
              width: 100,
              height: 200,
              isExternal: true,
            };
            const promise = authentication.authenticate(authenticationParams);

            const message = utils.findMessageByFunc('authentication.authenticate');
            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                func: 'authentication.authenticate.failure',
                args: [false, errorMessage],
              },
            } as DOMMessageEvent);

            await expect(promise).rejects.toThrowError(errorMessage);
          });
        }
      });
    });

    describe('Testing authentication.registerAuthenticationHandlers function', () => {
      allowedContexts.forEach((context) => {
        allowedHostClientType.forEach((hostClientType) => {
          it(`authentication.registerAuthenticationHandlers should successfully ask parent window to open auth window with parameters in the ${hostClientType} client from ${context} context in legacy flow`, (done) => {
            utils.initializeWithContext(context, hostClientType).then(async () => {
              const authenticationParams: authentication.AuthenticateParameters = {
                url: 'https://someurl',
                width: 100,
                height: 200,
                isExternal: true,
                successCallback: (result: string) => {
                  expect(result).toEqual(mockResult);
                  done();
                },
                failureCallback: () => {
                  done();
                },
              };
              authentication.registerAuthenticationHandlers(authenticationParams);
              authentication.authenticate();

              const message = utils.findMessageByFunc('authentication.authenticate');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(4);
              expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
              expect(message.args[1]).toBe(authenticationParams.width);
              expect(message.args[2]).toBe(authenticationParams.height);
              expect(message.args[3]).toBe(authenticationParams.isExternal);

              await utils.respondToFramelessMessage({
                data: {
                  id: message.id,
                  args: [true, mockResult],
                },
              } as DOMMessageEvent);
            });
          });

          it(`authentication.registerAuthenticationHandlers should handle auth failure with parameters in the ${hostClientType} client from ${context} context in legacy flow`, (done) => {
            utils.initializeWithContext(context, hostClientType).then(async () => {
              const authenticationParams: authentication.AuthenticateParameters = {
                url: 'https://someurl',
                width: 100,
                height: 200,
                isExternal: true,
                successCallback: () => {
                  done();
                },
                failureCallback: (reason: string) => {
                  expect(reason).toEqual(errorMessage);
                  done();
                },
              };
              authentication.registerAuthenticationHandlers(authenticationParams);
              authentication.authenticate();

              const message = utils.findMessageByFunc('authentication.authenticate');
              await utils.respondToFramelessMessage({
                data: {
                  id: message.id,
                  args: [errorMessage],
                },
              } as DOMMessageEvent);
            });
          });
        });
      });
    });

    describe('Testing authentication.getAuthToken function', () => {
      it('authentication.getAuthToken should not allow calls before initialization', () => {
        const authTokenRequest = {
          resources: [mockResource],
          claims: [mockClaim],
          silent: false,
        };

        expect(() => authentication.getAuthToken(authTokenRequest)).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`authentication.getAuthToken should successfully return token in case of success in legacy flow from ${context} context`, (done) => {
          utils.initializeWithContext(context).then(async () => {
            const authTokenRequest = {
              resources: [mockResource],
              claims: [mockClaim],
              silent: false,
              failureCallback: () => {
                done();
              },
              successCallback: (result) => {
                expect(result).toEqual('token');
                done();
              },
            };

            authentication.getAuthToken(authTokenRequest);

            const message = utils.findMessageByFunc('authentication.getAuthToken');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(4);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toEqual([mockClaim]);
            expect(message.args[2]).toEqual(false);

            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [true, 'token'],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getAuthToken should throw error in case of failure in legacy flow from ${context} context`, (done) => {
          utils.initializeWithContext(context).then(async () => {
            const authTokenRequest = {
              resources: [mockResource],
              failureCallback: (error) => {
                expect(error).toEqual(errorMessage);
                done();
              },
              successCallback: () => {
                done();
              },
            };

            authentication.getAuthToken(authTokenRequest);

            const message = utils.findMessageByFunc('authentication.getAuthToken');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(4);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toBeNull();
            expect(message.args[2]).toBeNull();
            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [false, errorMessage],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getAuthToken should successfully return token in case of success from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const authTokenRequest = {
            resources: [mockResource],
            claims: [mockClaim],
            silent: false,
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual([mockClaim]);
          expect(message.args[2]).toEqual(false);
          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [true, 'token'],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should successfully return token in case of success when using no authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toBeNull();
          expect(message.args[1]).toBeNull();
          expect(message.args[2]).toBeNull();

          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [true, 'token'],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should throw error in case of failure from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const authTokenRequest: authentication.AuthTokenRequestParameters = {
            resources: [mockResource],
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toBeNull();
          expect(message.args[2]).toBeNull();
          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [false, errorMessage],
            },
          } as DOMMessageEvent);
          await expect(promise).rejects.toThrowError(errorMessage);
        });

        it(`authentication.getAuthToken should throw error in case of failure when using no authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(4);
          expect(message.args[0]).toBeNull();
          expect(message.args[1]).toBeNull();
          expect(message.args[2]).toBeNull();

          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [false, errorMessage],
            },
          } as DOMMessageEvent);
          await expect(promise).rejects.toThrowError(errorMessage);
        });
      });
    });

    describe('Testing authentication.getUser function', () => {
      it('authentication.getUser should not allow calls before initialization', () => {
        expect(() => authentication.getUser()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`authentication.getUser should successfully get user profile in legacy flow with ${context} context`, (done) => {
          utils.initializeWithContext(context).then(async () => {
            const successCallback = (user: authentication.UserProfile): void => {
              expect(user).toEqual(mockResult);
              done();
            };
            const failureCallback = (): void => {
              done();
            };
            const userRequest: authentication.UserRequest = {
              successCallback: successCallback,
              failureCallback: failureCallback,
            };
            authentication.getUser(userRequest);
            const message = utils.findMessageByFunc('authentication.getUser');
            expect(message).not.toBeNull();
            expect(message.id).toBe(1);
            expect(message.args[0]).toBe(undefined);
            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [true, mockResult],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getUser should throw error in getting user profile in legacy flow with ${context} context`, (done) => {
          utils.initializeWithContext(context).then(async () => {
            const successCallback = (): void => {
              done();
            };
            const failureCallback = (reason: string): void => {
              expect(reason).toMatch(new RegExp(sdkError.message!));
              done();
            };
            const userRequest: authentication.UserRequest = {
              successCallback: successCallback,
              failureCallback: failureCallback,
            };
            authentication.getUser(userRequest);
            const message = utils.findMessageByFunc('authentication.getUser');
            expect(message).not.toBeNull();
            expect(message.id).toBe(1);
            expect(message.args[0]).toBe(undefined);
            await utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [false, sdkError],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getUser should throw error in getting user profile with ${context} context`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [false, sdkError],
            },
          } as DOMMessageEvent);
          await expect(promise).rejects.toThrowError(new RegExp(errorMessage));
        });

        it(`authentication.getUser should successfully get user profile with ${context} context`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [true, mockUser],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual(mockUser);
        });

        it(`authentication.getUser should successfully get user profile including data residency info with ${context} context if data residency is provided by hosts`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          await utils.respondToFramelessMessage({
            data: {
              id: message.id,
              args: [true, mockUserWithDataResidency],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual(mockUserWithDataResidency);
        });
      });
    });

    describe('Testing authentication.notifySuccess function', () => {
      const allowedContexts = [FrameContexts.authentication];

      it('authentication.notifySuccess should not allow calls before initialization', () => {
        expect(() => authentication.notifySuccess()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
          it(`authentication.notifySuccess should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => authentication.notifySuccess()).toThrow(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        } else {
          it(`authentication.notifySuccess should successfully notify auth success from ${context} context`, async () => {
            await utils.initializeWithContext(context, HostClientType.android);

            authentication.notifySuccess(mockResult);
            const message = utils.findMessageByFunc('authentication.authenticate.success');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(mockResult);
          });
        }
      });
    });

    describe('Testing authentication.notifyFailure', () => {
      const allowedContexts = [FrameContexts.authentication];
      it('authentication.notifyFailure should not allow calls before initialization', () => {
        expect(() => authentication.notifyFailure()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
          it(`authentication.notifyFailure should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => authentication.notifyFailure()).toThrow(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        } else {
          it(`authentication.notifyFailure should successfully notify auth failure from ${context} context`, async () => {
            await utils.initializeWithContext(context, HostClientType.android);

            authentication.notifyFailure(mockResult);
            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(mockResult);
          });
        }
      });
    });
  });
});
