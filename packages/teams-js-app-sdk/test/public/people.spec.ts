import { FramelessPostMocks } from '../framelessPostMocks';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { ErrorCode } from '../../src/public/interfaces';
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
    app._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  /**
   * People Picker tests
   */
  it('should allow selectPeople calls with null peoplePickerInputs', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    return expect(people.selectPeople(null)).resolves;
  });

  it('should allow selectPeople calls with no peoplePickerInputs', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    return expect(people.selectPeople()).resolves;
  });

  it('should allow selectPeople calls with undefined peoplePickerInputs', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    return expect(people.selectPeople(undefined)).resolves;
  });

  it('selectPeople call in default version of platform support fails', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
    return expect(people.selectPeople()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
  });

  it('selectPeople call in task frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.task);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    people.selectPeople();
    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectPeople call in content frameContext works', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    people.selectPeople();
    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('selectPeople calls with successful result', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    const promise = people.selectPeople();

    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    const result = [
      {
        objectId: '5842943a-aa5a-470a-bfdc-7311b9988962',
        displayName: 'Sonal Jha',
        email: 'sojh@m365x347208.onmicrosoft.com',
      } as people.PeoplePickerResult,
    ];
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [undefined, result],
      },
    } as DOMMessageEvent);

    const peopleResult = await promise;
    expect(peopleResult.length).toBe(1);
    const person = peopleResult[0];
    expect(person).not.toBeNull();
    expect(person.objectId).not.toBeNull();
    expect(typeof person.objectId === 'string').toBeTruthy();
    expect(typeof person.displayName === 'string').toBeTruthy();
    expect(typeof person.email === 'string').toBeTruthy();
    expect(person.objectId).toBe('5842943a-aa5a-470a-bfdc-7311b9988962');
    expect(person.displayName).toBe('Sonal Jha');
    expect(person.email).toBe('sojh@m365x347208.onmicrosoft.com');
  });

  it('selectPeople calls with error', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.content);
    mobilePlatformMock.setClientSupportedSDKVersion(minVersionForSelectPeople);
    const peoplePickerInput: people.PeoplePickerInputs = {
      title: 'Hello World',
      setSelected: null,
      openOrgWideSearchInChatOrChannel: true,
      singleSelect: true,
    };
    const promise = people.selectPeople(peoplePickerInput);

    const message = mobilePlatformMock.findMessageByFunc('people.selectPeople');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);

    const callbackId = message.id;
    mobilePlatformMock.respondToMessage({
      data: {
        id: callbackId,
        args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
      },
    } as DOMMessageEvent);

    expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
  });
});
