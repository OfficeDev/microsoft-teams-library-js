// import * as communication from '../../src/internal/communication';
import { errorLibraryNotInitialized } from '../../src/internal/constants';
import * as handlers from '../../src/internal/handlers';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts, HostClientType } from '../../src/public';
import { app } from '../../src/public/app';
import { authentication } from '../../src/public/authentication';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('Testing authentication capability', () => {
  const framelessPostMock = new FramelessPostMocks();
  const utils = new Utils();

  const errorMessage = 'mockError';
  const mockResult = 'someResult';
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
    HostClientType.rigel,
    HostClientType.teamsDisplays,
    HostClientType.teamsPhones,
    HostClientType.teamsRoomsAndroid,
    HostClientType.teamsRoomsWindows,
  ];
  describe('FRAMED - authentication tests', () => {
    beforeEach(() => {
      // Use to send a mock message from the app.
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

          allowedHostClientType.forEach((hostClientType) => {
            it(`authentication.authenticate should successfully pop up the auth window in the ${hostClientType} client in legacy flow from ${context} context`, () => {
              return utils.initializeWithContext(context, hostClientType).then(() => {
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

            it(`authentication.authenticate it should successfully handle auth success in the ${hostClientType} client in legacy flow from ${context} context`, (done) => {
              expect.assertions(2);
              utils.initializeWithContext(context, hostClientType).then(() => {
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

                const message = utils.findMessageByFunc('authentication.authenticate');
                expect(message).not.toBeNull();
                utils.respondToMessage(message, true, mockResult);
              });
            });

            it(`authentication.authenticate should successfully handle auth failure in the ${hostClientType} client in legacy flow from ${context} context`, (done) => {
              expect.assertions(2);
              utils.initializeWithContext(context, hostClientType).then(() => {
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

                utils.respondToMessage(message, false, errorMessage);
              });
            });
          });
        } else {
          it(`authentication.authenticate should not allow calls from ${context} context`, async () => {
            expect.assertions(1);
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

        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('authentication.getAuthToken');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`authentication.getAuthToken should successfully return token in case of success in legacy flow from ${context} context`, (done) => {
          expect.assertions(6);
          utils.initializeWithContext(context).then(() => {
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
            expect(message.args.length).toBe(3);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toEqual([mockClaim]);
            expect(message.args[2]).toEqual(false);

            utils.respondToMessage(message, true, 'token');
          });
        });

        it(`authentication.getAuthToken should successfully return error from getAuthToken in case of failure in legacy flow from ${context} context`, (done) => {
          expect.assertions(6);
          utils.initializeWithContext(context).then(() => {
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
            expect(message.args.length).toBe(3);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toEqual(undefined);
            expect(message.args[2]).toEqual(undefined);

            utils.respondToMessage(message, false, errorMessage);
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
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual([mockClaim]);
          expect(message.args[2]).toEqual(false);

          utils.respondToMessage(message, true, 'token');
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should successfully return token in case of success when using no authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toEqual(undefined);
          expect(message.args[1]).toEqual(undefined);
          expect(message.args[2]).toEqual(undefined);

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
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual(undefined);
          expect(message.args[2]).toEqual(undefined);

          utils.respondToMessage(message, false, errorMessage);
          await expect(promise).rejects.toThrowError(errorMessage);
        });

        it(`authentication.getAuthToken should return error in case of failure when using no authTokenRequest from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = utils.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toEqual(undefined);
          expect(message.args[1]).toEqual(undefined);
          expect(message.args[2]).toEqual(undefined);

          utils.respondToMessage(message, false, errorMessage);
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

        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('authentication.getUser');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`authentication.getUser should successfully get user profile in legacy flow with ${context} context`, (done) => {
          utils.initializeWithContext(context).then(() => {
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
            utils.respondToMessage(message, true, mockResult);
          });
        });

        it(`authentication.getUser should throw error in getting user profile in legacy flow with ${context} context`, (done) => {
          utils.initializeWithContext(context).then(() => {
            const successCallback = (): void => {
              done();
            };
            const failureCallback = (reason: string): void => {
              expect(reason).toBe(mockResult);
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
            utils.respondToMessage(message, false, mockResult);
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
          utils.respondToMessage(message, false, mockResult);
          await expect(promise).rejects.toThrowError(mockResult);
        });

        it(`authentication.getUser should successfully get user profile with ${context} context`, async () => {
          expect.assertions(4);
          await utils.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = utils.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          utils.respondToMessage(message, true, mockUser);
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
          utils.respondToMessage(message, true, mockUserWithDataResidency);
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
          it(`authentication.notifySuccess should successfully notify auth success from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifySuccess(mockResult);
            const message = utils.findMessageByFunc('authentication.authenticate.success');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(mockResult);
          });

          it(`authentication.notifySuccess should do window redirect if callbackUrl is for win32 Outlook with ${context} context`, async () => {
            expect.assertions(2);
            let windowAssignSpyCalled = false;
            jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url): void => {
              windowAssignSpyCalled = true;
              expect(url).toEqual(
                'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&result=someResult&authSuccess',
              );
            });

            await utils.initializeWithContext(context);

            authentication.notifySuccess(
              mockResult,
              'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
            );
            expect(windowAssignSpyCalled).toBe(true);
          });

          it(`authentication.notifySuccess should do window redirect if callbackUrl is for win32 Outlook and no result param specified from ${context} context`, async () => {
            expect.assertions(2);
            let windowAssignSpyCalled = false;
            jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url): void => {
              windowAssignSpyCalled = true;
              expect(url).toEqual(
                'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&authSuccess',
              );
            });

            await utils.initializeWithContext(context);

            authentication.notifySuccess(
              null,
              'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
            );
            expect(windowAssignSpyCalled).toBe(true);
          });

          it(`authentication.notifySuccess should do window redirect if callbackUrl is for win32 Outlook but does not have URL fragments from ${context} context`, async () => {
            expect.assertions(2);
            let windowAssignSpyCalled = false;
            jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url): void => {
              windowAssignSpyCalled = true;
              expect(url).toEqual(
                'https://outlook.office.com/connectors?client_type=Win32_Outlook#&result=someResult&authSuccess',
              );
            });

            await utils.initializeWithContext(context);

            authentication.notifySuccess(
              mockResult,
              'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook',
            );
            expect(windowAssignSpyCalled).toBe(true);
          });

          it(`authentication.notifySuccess should successfully notify auth success if callbackUrl is not for win32 Outlook ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifySuccess(
              mockResult,
              'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
            );
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

          it(`authentication.notifyFailure should do window redirect if callbackUrl is for win32 Outlook and auth failure happens from ${context} context`, async () => {
            expect.assertions(2);
            let windowAssignSpyCalled = false;
            jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url): void => {
              windowAssignSpyCalled = true;
              expect(url).toEqual(
                `https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&reason=${errorMessage}&authFailure`,
              );
            });

            await utils.initializeWithContext(context);

            authentication.notifyFailure(
              errorMessage,
              'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
            );
            expect(windowAssignSpyCalled).toBe(true);
          });

          it(`authentication.notifyFailure should successfully notify auth failure if callbackUrl is not for win32 Outlook from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifyFailure(
              errorMessage,
              'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
            );
            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(errorMessage);
          });

          it(`authentication.notifyFailure should successfully notify auth failure if callbackUrl is not for win32 Outlook and reason is empty from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifyFailure(
              '',
              'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
            );
            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe('');
          });

          it(`authentication.notifyFailure should successfully notify auth failure if callbackUrl and reason are empty from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifyFailure('', '');
            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe('');
          });

          it(`authentication.notifyFailure should successfully notify auth failure if callbackUrl is empty from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            authentication.notifyFailure(errorMessage, '');
            const message = utils.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(errorMessage);
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
    beforeEach(() => {
      // Use to send a mock message from the app.
      framelessPostMock.messages = [];
      // Set a mock window for testing
      app._initialize(framelessPostMock.mockWindow);
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (app._uninitialize) {
        app._uninitialize();
      }
    });

    describe('Testing authentication.authenticate function', () => {
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`authentication.authenticate should not allow calls from ${context} context`, async () => {
            await framelessPostMock.initializeWithContext(context);
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
          allowedHostClientType.forEach((hostClientType) => {
            it(`authentication.authenticate should successfully ask parent window to open auth window with parameters in the ${hostClientType} client from ${context} context`, async () => {
              await framelessPostMock.initializeWithContext(context, hostClientType);
              const authenticationParams: authentication.AuthenticatePopUpParameters = {
                url: 'https://someurl',
                width: 100,
                height: 200,
                isExternal: true,
              };
              const promise = authentication.authenticate(authenticationParams);

              const message = framelessPostMock.findMessageByFunc('authentication.authenticate');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(4);
              expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
              expect(message.args[1]).toBe(authenticationParams.width);
              expect(message.args[2]).toBe(authenticationParams.height);
              expect(message.args[3]).toBe(authenticationParams.isExternal);

              framelessPostMock.respondToMessage({
                data: {
                  id: message.id,
                  args: [true, mockResult],
                },
              } as DOMMessageEvent);
              await expect(promise).resolves.toEqual(mockResult);
            });

            it(`authentication.authenticate should handle auth failure with parameters in the ${hostClientType} client from ${context} context`, async () => {
              await framelessPostMock.initializeWithContext(context, hostClientType);
              const authenticationParams: authentication.AuthenticatePopUpParameters = {
                url: 'https://someurl',
                width: 100,
                height: 200,
                isExternal: true,
              };
              const promise = authentication.authenticate(authenticationParams);

              const message = framelessPostMock.findMessageByFunc('authentication.authenticate');
              framelessPostMock.respondToMessage({
                data: {
                  id: message.id,
                  func: 'authentication.authenticate.failure',
                  args: [false, errorMessage],
                },
              } as DOMMessageEvent);

              await expect(promise).rejects.toThrowError(errorMessage);
            });
          });
        }
      });
    });

    describe('Testing authentication.registerAuthenticationHandlers function', () => {
      allowedContexts.forEach((context) => {
        allowedHostClientType.forEach((hostClientType) => {
          it(`authentication.registerAuthenticationHandlers should successfully ask parent window to open auth window with parameters in the ${hostClientType} client from ${context} context in legacy flow`, (done) => {
            framelessPostMock.initializeWithContext(context, hostClientType).then(() => {
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

              const message = framelessPostMock.findMessageByFunc('authentication.authenticate');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(4);
              expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
              expect(message.args[1]).toBe(authenticationParams.width);
              expect(message.args[2]).toBe(authenticationParams.height);
              expect(message.args[3]).toBe(authenticationParams.isExternal);

              framelessPostMock.respondToMessage({
                data: {
                  id: message.id,
                  args: [true, mockResult],
                },
              } as DOMMessageEvent);
            });
          });

          it(`authentication.registerAuthenticationHandlers should handle auth failure with parameters in the ${hostClientType} client from ${context} context in legacy flow`, (done) => {
            framelessPostMock.initializeWithContext(context, hostClientType).then(() => {
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

              const message = framelessPostMock.findMessageByFunc('authentication.authenticate');
              framelessPostMock.respondToMessage({
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
          framelessPostMock.initializeWithContext(context).then(() => {
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

            const message = framelessPostMock.findMessageByFunc('authentication.getAuthToken');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(3);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toEqual([mockClaim]);
            expect(message.args[2]).toEqual(false);

            framelessPostMock.respondToMessage({
              data: {
                id: message.id,
                args: [true, 'token'],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getAuthToken should throw error in case of failure in legacy flow from ${context} context`, (done) => {
          framelessPostMock.initializeWithContext(context).then(() => {
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

            const message = framelessPostMock.findMessageByFunc('authentication.getAuthToken');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(3);
            expect(message.args[0]).toEqual([mockResource]);
            expect(message.args[1]).toBeNull();
            expect(message.args[2]).toBeNull();
            framelessPostMock.respondToMessage({
              data: {
                id: message.id,
                args: [false, errorMessage],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getAuthToken should successfully return token in case of success from ${context} context`, async () => {
          await framelessPostMock.initializeWithContext(context);

          const authTokenRequest = {
            resources: [mockResource],
            claims: [mockClaim],
            silent: false,
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = framelessPostMock.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toEqual([mockClaim]);
          expect(message.args[2]).toEqual(false);
          framelessPostMock.respondToMessage({
            data: {
              id: message.id,
              args: [true, 'token'],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should successfully return token in case of success when using no authTokenRequest from ${context} context`, async () => {
          await framelessPostMock.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = framelessPostMock.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toBeNull();
          expect(message.args[1]).toBeNull();
          expect(message.args[2]).toBeNull();

          framelessPostMock.respondToMessage({
            data: {
              id: message.id,
              args: [true, 'token'],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual('token');
        });

        it(`authentication.getAuthToken should throw error in case of failure from ${context} context`, async () => {
          await framelessPostMock.initializeWithContext(context);

          const authTokenRequest: authentication.AuthTokenRequestParameters = {
            resources: [mockResource],
          };

          const promise = authentication.getAuthToken(authTokenRequest);

          const message = framelessPostMock.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toEqual([mockResource]);
          expect(message.args[1]).toBeNull();
          expect(message.args[2]).toBeNull();
          framelessPostMock.respondToMessage({
            data: {
              id: message.id,
              args: [false, errorMessage],
            },
          } as DOMMessageEvent);
          await expect(promise).rejects.toThrowError(errorMessage);
        });

        it(`authentication.getAuthToken should throw error in case of failure when using no authTokenRequest from ${context} context`, async () => {
          await framelessPostMock.initializeWithContext(context);

          const promise = authentication.getAuthToken();

          const message = framelessPostMock.findMessageByFunc('authentication.getAuthToken');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(3);
          expect(message.args[0]).toBeNull();
          expect(message.args[1]).toBeNull();
          expect(message.args[2]).toBeNull();

          framelessPostMock.respondToMessage({
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
          framelessPostMock.initializeWithContext(context).then(() => {
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
            const message = framelessPostMock.findMessageByFunc('authentication.getUser');
            expect(message).not.toBeNull();
            expect(message.id).toBe(1);
            expect(message.args[0]).toBe(undefined);
            framelessPostMock.respondToMessage({
              data: {
                id: message.id,
                args: [true, mockResult],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getUser should throw error in getting user profile in legacy flow with ${context} context`, (done) => {
          framelessPostMock.initializeWithContext(context).then(() => {
            const successCallback = (): void => {
              done();
            };
            const failureCallback = (reason: string): void => {
              expect(reason).toBe(mockResult);
              done();
            };
            const userRequest: authentication.UserRequest = {
              successCallback: successCallback,
              failureCallback: failureCallback,
            };
            authentication.getUser(userRequest);
            const message = framelessPostMock.findMessageByFunc('authentication.getUser');
            expect(message).not.toBeNull();
            expect(message.id).toBe(1);
            expect(message.args[0]).toBe(undefined);
            framelessPostMock.respondToMessage({
              data: {
                id: message.id,
                args: [false, mockResult],
              },
            } as DOMMessageEvent);
          });
        });

        it(`authentication.getUser should throw error in getting user profile with ${context} context`, async () => {
          expect.assertions(7);
          await framelessPostMock.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = framelessPostMock.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          framelessPostMock.respondToMessage({
            data: {
              id: message.id,
              args: [false, mockResult],
            },
          } as DOMMessageEvent);
          await expect(promise).rejects.toThrowError(mockResult);
        });

        it(`authentication.getUser should successfully get user profile with ${context} context`, async () => {
          expect.assertions(7);
          await framelessPostMock.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = framelessPostMock.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          framelessPostMock.respondToMessage({
            data: {
              id: message.id,
              args: [true, mockUser],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.toEqual(mockUser);
        });

        it(`authentication.getUser should successfully get user profile including data residency info with ${context} context if data residency is provided by hosts`, async () => {
          expect.assertions(7);
          await framelessPostMock.initializeWithContext(context);
          const promise = authentication.getUser();
          const message = framelessPostMock.findMessageByFunc('authentication.getUser');
          expect(message).not.toBeNull();
          expect(message.id).toBe(1);
          expect(message.args[0]).toBe(undefined);
          framelessPostMock.respondToMessage({
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
            await framelessPostMock.initializeWithContext(context);
            expect(() => authentication.notifySuccess()).toThrow(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        } else {
          it(`authentication.notifySuccess should successfully notify auth success from ${context} context`, async () => {
            await framelessPostMock.initializeWithContext(context, HostClientType.android);

            authentication.notifySuccess(mockResult);
            const message = framelessPostMock.findMessageByFunc('authentication.authenticate.success');
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
            await framelessPostMock.initializeWithContext(context);
            expect(() => authentication.notifyFailure()).toThrow(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        } else {
          it(`authentication.notifyFailure should successfully notify auth failure from ${context} context`, async () => {
            await framelessPostMock.initializeWithContext(context, HostClientType.android);

            authentication.notifyFailure(mockResult);
            const message = framelessPostMock.findMessageByFunc('authentication.authenticate.failure');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toBe(mockResult);
          });
        }
      });
    });
  });
});
