import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { people } from '../../src/public/people';
import { _minRuntimeConfigToUninitialize, v1HostClientTypes } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for selectPeople API
 */
describe('people', () => {
  const framelessPlatformMock = new FramelessPostMocks();
  const framedMock = new Utils();
  const minVersionForSelectPeople = '2.0.0';
  const originalDefaultPlatformVersion = '1.6.0';

  beforeEach(() => {
    framelessPlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(framelessPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framedMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });
  const allowedContexts = [FrameContexts.content, FrameContexts.task, FrameContexts.settings];
  const result = [
    {
      objectId: '5842943a-aa5a-470a-bfdc-7311b9988962',
      displayName: 'Sonal Jha',
      email: 'sojh@m365x347208.onmicrosoft.com',
    } as people.PeoplePickerResult,
  ];
  const input = {
    title: 'Title',
    openOrgWideSearchInChatOrChannel: true,
  };
  describe('peoplePicker', () => {
    /**
     * People Picker tests
     */
    it('should not allow selectPeople calls before initialization', () => {
      expect(() => people.selectPeople()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        Object.values(v1HostClientTypes).forEach(hostClientType => {
          it(`should throw error when people is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(people.selectPeople()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`should allow selectPeople calls with null peoplePickerInputs. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople(null);
            const selectPeopleMessage = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(selectPeopleMessage).not.toBeNull();
            expect(selectPeopleMessage.args[0]).toEqual(null);
          });

          it(`should allow selectPeople calls with no peoplePickerInputs. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople();
            const selectPeopleMessage = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(selectPeopleMessage).not.toBeNull();
            expect(selectPeopleMessage.args[0]).toEqual(null);
          });

          it(`should allow selectPeople calls with undefined peoplePickerInputs. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople(undefined);
            const selectPeopleMessage = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(selectPeopleMessage).not.toBeNull();
            expect(selectPeopleMessage.args[0]).toEqual(null);
          });

          it(`selectPeople call in default version of platform support fails. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            await expect(people.selectPeople()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
          });

          it(`selectPeople calls with peoplePickerInput. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            const promise = people.selectPeople(input);

            const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');

            const callbackId = message.id;
            framelessPlatformMock.respondToMessage({
              data: {
                id: callbackId,
                args: [undefined, result],
              },
            } as DOMMessageEvent);

            await expect(promise).resolves.toBe(result);
          });

          it(`selectPeople calls with error. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            const peoplePickerInput: people.PeoplePickerInputs = {
              title: 'Hello World',
              setSelected: null,
              openOrgWideSearchInChatOrChannel: true,
              singleSelect: true,
            };
            const promise = people.selectPeople(peoplePickerInput);

            const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);

            const callbackId = message.id;
            framelessPlatformMock.respondToMessage({
              data: {
                id: callbackId,
                args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
              },
            } as DOMMessageEvent);

            expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          });
        });
      } else {
        it(`should not allow selectPeople calls from the wrong context. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => people.selectPeople()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing people.isSupported function', () => {
    it('people.isSupported should return false if the runtime says people is not supported', () => {
      framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(people.isSupported()).not.toBeTruthy();
    });

    it('people.isSupported should return true if the runtime says people is supported', () => {
      framedMock.setRuntimeConfig({ apiVersion: 1, supports: { people: {} } });
      expect(people.isSupported()).toBeTruthy();
    });
  });

  /* eslint-disable @typescript-eslint/no-empty-function */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  describe('peoplePicker_V1', () => {
    /**
     * People Picker tests
     */
    it('should not allow selectPeople calls before initialization', () => {
      expect(() => people.selectPeople(() => {})).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        Object.values(v1HostClientTypes).forEach(hostClientType => {
          it(`should throw error when people is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(people.selectPeople(() => {})).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`should allow selectPeople calls with null peoplePickerInputs context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {}, null);
            const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(null);
          });

          it(`should allow selectPeople calls with no peoplePickerInputs. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {});
            const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(null);
          });

          it(`should allow selectPeople calls with undefined peoplePickerInputs. context: ${context}`, async () => {
            await framelessPlatformMock.initializeWithContext(context, hostClientType);
            framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {}, undefined);
            const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(null);
          });

          it(`selectPeople call in default version of platform support fails. context: ${context}`, done => {
            framelessPlatformMock.initializeWithContext(context, hostClientType).then(() => {
              framelessPlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
              people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {
                expect(error).not.toBeNull();
                expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
                done();
              });
            });
          });

          it(`selectPeople calls with valid peoplePickerInput. context: ${context}`, done => {
            framelessPlatformMock.initializeWithContext(context, hostClientType).then(() => {
              framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);

              people.selectPeople((e: SdkError, m: people.PeoplePickerResult[]) => {
                expect(e).toBeFalsy();
                expect(m).toBe(result);
                done();
              }, input);

              const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');

              const callbackId = message.id;
              framelessPlatformMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [undefined, result],
                },
              } as DOMMessageEvent);
            });
          });

          it(`selectPeople calls with error. context: ${context}`, done => {
            framelessPlatformMock.initializeWithContext(context, hostClientType).then(() => {
              framelessPlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);

              const peoplePickerInput: people.PeoplePickerInputs = {
                title: 'Hello World',
                setSelected: null,
                openOrgWideSearchInChatOrChannel: true,
                singleSelect: true,
              };
              people.selectPeople((e: SdkError, m: people.PeoplePickerResult[]) => {
                expect(m).toBeFalsy();
                expect(e.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
                done();
              }, peoplePickerInput);

              const message = framelessPlatformMock.findMessageByFunc('people.selectPeople');

              const callbackId = message.id;
              framelessPlatformMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
                },
              } as DOMMessageEvent);
            });
          });
        });
      } else {
        it(`should not allow selectPeople calls from the wrong context. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() =>
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {}, null),
          ).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
