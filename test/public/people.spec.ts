import { FramelessPostMocks } from '../framelessPostMocks';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { FrameContexts } from '../../src/public/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { SdkError, ErrorCode } from '../../src/public/interfaces';
import { people } from '../../src/public/people';

/**
 * Test cases for selectPeople API
 */
describe('peoplePicker', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const minVersionForSelectPeople = '2.0.0';
  const originalDefaultPlatformVersion = '1.6.0';
 
  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    _initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  let emptyCallback = () => {};

  /**
   * People Picker tests
   */
  it('should not allow selectPeople calls with null callback', () => {
    expect(() => people.selectPeople(null)).toThrowError(
      '[people picker] Callback cannot be null',
    );
  });

  it('should allow selectPeople calls with null peoplePickerInputs', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    let peoplePickerError: SdkError;
    people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {
      peoplePickerError = error;
    }, null);
    expect(peoplePickerError).toBeUndefined();
  });

  it('should allow selectPeople calls with no peoplePickerInputs', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    let peoplePickerError: SdkError;
    people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {
      peoplePickerError = error;
    });
    expect(peoplePickerError).toBeUndefined();
  });

  it('should allow selectPeople calls with undefined peoplePickerInputs', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    let peoplePickerError: SdkError;
    people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {
      peoplePickerError = error;
    }, undefined);
    expect(peoplePickerError).toBeUndefined();
  });

  it('selectPeople call in default version of platform support fails', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    let peoplePickerError: SdkError;
    people.selectPeople((error: SdkError, people: people.PeoplePickerResult[]) => {
      peoplePickerError = error;
    });
    expect(peoplePickerError).not.toBeNull();
    expect(peoplePickerError.errorCode).toBe(ErrorCode.OLD_PLATFORM);
  });

  it('selectPeople call in task frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    people.selectPeople(emptyCallback);
    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectPeople call in content frameContext works', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    people.selectPeople(emptyCallback);
    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectPeople calls with successful result', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    let peoplePickerResult: people.PeoplePickerResult[], peoplePickerError: SdkError;
    people.selectPeople((e: SdkError, m: people.PeoplePickerResult[]) => {
      peoplePickerError = e;
      peoplePickerResult = m;
    });

    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    const result = [{
     objectId: "5842943a-aa5a-470a-bfdc-7311b9988962",
     displayName: "Sonal Jha",
     email: "sojh@m365x347208.onmicrosoft.com"
    } as people.PeoplePickerResult];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, result]
      }
    } as DOMMessageEvent)

    expect(peoplePickerError).toBeFalsy();
    expect(result.length).toBe(1);
    const person = result[0];
    expect(person).not.toBeNull();
    expect(person.objectId).not.toBeNull();
    expect(typeof person.objectId === 'string').toBeTruthy();
    expect(typeof person.displayName === 'string').toBeTruthy();
    expect(typeof person.email === 'string').toBeTruthy();
    expect(person.objectId).toBe('5842943a-aa5a-470a-bfdc-7311b9988962');
    expect(person.displayName).toBe('Sonal Jha');
    expect(person.email).toBe('sojh@m365x347208.onmicrosoft.com');
  });

  it('selectPeople calls with error', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    let peoplePickerResult: people.PeoplePickerResult[], peoplePickerError: SdkError;
    const peoplePickerInput: people.PeoplePickerInputs = {
     title: "Hello World",
     setSelected: null,
     openOrgWideSearchInChatOrChannel: true,
     singleSelect: true
    };
    people.selectPeople( (e: SdkError, m: people.PeoplePickerResult[]) => {
      peoplePickerError = e;
      peoplePickerResult = m;
    }, peoplePickerInput);

    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.INTERNAL_ERROR }]
      }
    } as DOMMessageEvent)

    expect(peoplePickerResult).toBeFalsy();
    expect(peoplePickerError.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
  });
});