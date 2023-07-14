import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { people } from '../../src/public/people';
import { v1HostClientTypes } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for selectPeople API
 */
describe('people', () => {
  const utils = new Utils();
  const minVersionForSelectPeople = '2.0.0';
  const originalDefaultPlatformVersion = '1.6.0';
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
      expect(() => people.selectPeople()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    describe('frameless', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.mockWindow.parent = undefined;
        utils.messages = [];
        GlobalVars.isFramelessWindow = false;
      });
      afterEach(() => {
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          Object.values(v1HostClientTypes).forEach((hostClientType) => {
            it(`should throw error when people is not supported in runtime config. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect(people.selectPeople()).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it(`should allow selectPeople calls with null peoplePickerInputs. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
              people.selectPeople(null);
              const selectPeopleMessage = utils.findMessageByFunc('people.selectPeople');
              expect(selectPeopleMessage).not.toBeNull();
              expect(selectPeopleMessage.args[0]).toEqual(null);
            });

            it(`should allow selectPeople calls with no peoplePickerInputs. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
              people.selectPeople();
              const selectPeopleMessage = utils.findMessageByFunc('people.selectPeople');
              expect(selectPeopleMessage).not.toBeNull();
              expect(selectPeopleMessage.args[0]).toEqual(null);
            });

            it(`should allow selectPeople calls with undefined peoplePickerInputs. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
              people.selectPeople(undefined);
              const selectPeopleMessage = utils.findMessageByFunc('people.selectPeople');
              expect(selectPeopleMessage).not.toBeNull();
              expect(selectPeopleMessage.args[0]).toEqual(null);
            });

            it(`selectPeople call in default version of platform support fails. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
              await expect(people.selectPeople()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
            });

            it(`selectPeople calls with peoplePickerInput. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
              const promise = people.selectPeople(input);

              const message = utils.findMessageByFunc('people.selectPeople');

              const callbackId = message.id;
              utils.respondToFramelessMessage({
                data: {
                  id: callbackId,
                  args: [undefined, result],
                },
              } as DOMMessageEvent);

              await expect(promise).resolves.toBe(result);
            });

            it(`selectPeople calls with error. context: ${context}`, async () => {
              await utils.initializeWithContext(context, hostClientType);
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
              const peoplePickerInput: people.PeoplePickerInputs = {
                title: 'Hello World',
                setSelected: null,
                openOrgWideSearchInChatOrChannel: true,
                singleSelect: true,
              };
              const promise = people.selectPeople(peoplePickerInput);

              const message = utils.findMessageByFunc('people.selectPeople');
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);

              const callbackId = message.id;
              utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

            expect(() => people.selectPeople()).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
  });

  describe('Testing people.isSupported function', () => {
    afterEach(() => {
      app._uninitialize();
    });
    it('people.isSupported should return false if the runtime says people is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(people.isSupported()).not.toBeTruthy();
    });

    it('people.isSupported should return true if the runtime says people is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { people: {} } });
      expect(people.isSupported()).toBeTruthy();
    });
    it('people.isSupported should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => people.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  /* eslint-disable @typescript-eslint/no-empty-function */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  describe('peoplePicker_V1', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    /**
     * People Picker tests
     */
    it('should not allow selectPeople calls before initialization', () => {
      expect(() => people.selectPeople(() => {})).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        Object.values(v1HostClientTypes).forEach((hostClientType) => {
          it(`should throw error when people is not supported in runtime config. context: ${context}`, async () => {
            await utils.initializeWithContext(context, hostClientType);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect(people.selectPeople(() => {})).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`should allow selectPeople calls with null peoplePickerInputs context: ${context}`, async () => {
            await utils.initializeWithContext(context, hostClientType);
            utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {}, null);
            const message = utils.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(null);
          });

          it(`should allow selectPeople calls with no peoplePickerInputs. context: ${context}`, async () => {
            await utils.initializeWithContext(context, hostClientType);
            utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {});
            const message = utils.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(null);
          });

          it(`should allow selectPeople calls with undefined peoplePickerInputs. context: ${context}`, async () => {
            await utils.initializeWithContext(context, hostClientType);
            utils.setClientSupportedSDKVersion(minVersionForSelectPeople);
            people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {}, undefined);
            const message = utils.findMessageByFunc('people.selectPeople');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(null);
          });

          it(`selectPeople call in default version of platform support fails. context: ${context}`, (done) => {
            utils.initializeWithContext(context, hostClientType).then(() => {
              utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
              people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {
                expect(error).not.toBeNull();
                expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
                done();
              });
            });
          });

          it(`selectPeople calls with valid peoplePickerInput. context: ${context}`, (done) => {
            utils.initializeWithContext(context, hostClientType).then(() => {
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);

              people.selectPeople((e: SdkError, m: people.PeoplePickerResult[]) => {
                expect(e).toBeFalsy();
                expect(m).toBe(result);
                done();
              }, input);

              const message = utils.findMessageByFunc('people.selectPeople');

              const callbackId = message.id;
              utils.respondToFramelessMessage({
                data: {
                  id: callbackId,
                  args: [undefined, result],
                },
              } as DOMMessageEvent);
            });
          });

          it(`selectPeople calls with error. context: ${context}`, (done) => {
            utils.initializeWithContext(context, hostClientType).then(() => {
              utils.setClientSupportedSDKVersion(minVersionForSelectPeople);

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

              const message = utils.findMessageByFunc('people.selectPeople');

              const callbackId = message.id;
              utils.respondToFramelessMessage({
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
          await utils.initializeWithContext(context);

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
