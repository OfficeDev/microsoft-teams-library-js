import { teamsDeepLinkHost, teamsDeepLinkProtocol } from '../../src/internal/constants';
import {
  teamsDeepLinkAttendeesUrlParameterName,
  teamsDeepLinkContentUrlParameterName,
  teamsDeepLinkEndTimeUrlParameterName,
  teamsDeepLinkMessageUrlParameterName,
  teamsDeepLinkSourceUrlParameterName,
  teamsDeepLinkStartTimeUrlParameterName,
  teamsDeepLinkSubjectUrlParameterName,
  teamsDeepLinkTopicUrlParameterName,
  teamsDeepLinkUrlPathForAppInstall,
  teamsDeepLinkUrlPathForCalendar,
  teamsDeepLinkUrlPathForCall,
  teamsDeepLinkUrlPathForChat,
  teamsDeepLinkUsersUrlParameterName,
  teamsDeepLinkWithVideoUrlParameterName,
} from '../../src/internal/deepLinkConstants';
import {
  createTeamsDeepLinkForAppInstallDialog,
  createTeamsDeepLinkForCalendar,
  createTeamsDeepLinkForCall,
  createTeamsDeepLinkForChat,
} from '../../src/internal/deepLinkUtilities';

export function validateDeepLinkPrefix(deepLink: URL, expectedPathName: string): void {
  expect(deepLink.protocol.toLowerCase() === teamsDeepLinkProtocol);
  expect(deepLink.host.toLowerCase() === teamsDeepLinkHost);
  expect(deepLink.pathname.toLowerCase() === expectedPathName);
}

export function validateCalendarDeepLinkPrefix(calendarDeepLink: URL): void {
  validateDeepLinkPrefix(calendarDeepLink, teamsDeepLinkUrlPathForCalendar);
}

export function validateCallDeepLinkPrefix(callDeepLink: URL): void {
  validateDeepLinkPrefix(callDeepLink, teamsDeepLinkUrlPathForCall);
}

export function validateChatDeepLinkPrefix(chatDeepLink: URL): void {
  validateDeepLinkPrefix(chatDeepLink, teamsDeepLinkUrlPathForChat);
}

export function validateDeepLinkUsers(deepLink: URL, expectedUsers: string[]): void {
  const searchParams = deepLink.searchParams;
  const userUrlValues: string[] = searchParams.getAll(teamsDeepLinkUsersUrlParameterName);
  expect(userUrlValues).toHaveLength(1);

  const users: string[] = userUrlValues[0].split(',');
  expect(users).toHaveLength(expectedUsers.length);

  for (const expectedUser of expectedUsers) {
    expect(users).toContain(expectedUser);
  }
}

export function validateChatDeepLinkTopic(chatDeepLink: URL, expectedTopic?: string): void {
  validateOptionalDeepLinkParameter(chatDeepLink, teamsDeepLinkTopicUrlParameterName, expectedTopic);
}

export function validateChatDeepLinkMessage(chatDeepLink: URL, expectedMessage?: string): void {
  validateOptionalDeepLinkParameter(chatDeepLink, teamsDeepLinkMessageUrlParameterName, expectedMessage);
}

export function validateCallDeepLinkWithVideo(callDeepLink: URL, expectedWithVideo?: boolean): void {
  validateOptionalDeepLinkParameter(
    callDeepLink,
    teamsDeepLinkWithVideoUrlParameterName,
    expectedWithVideo === undefined ? undefined : String(expectedWithVideo),
  );
}

export function validateCallDeepLinkSource(callDeepLink: URL, expectedSource?: string): void {
  validateOptionalDeepLinkParameter(callDeepLink, teamsDeepLinkSourceUrlParameterName, expectedSource);
}

export function validateDeepLinkAttendees(deepLink: URL, expectedAttendees?: string[]): void {
  const attendeeUrlValues: string[] = deepLink.searchParams.getAll(teamsDeepLinkAttendeesUrlParameterName);

  if (expectedAttendees === undefined) {
    expect(attendeeUrlValues).toHaveLength(0);
    return;
  }

  expect(attendeeUrlValues).toHaveLength(1);

  if (expectedAttendees.length === 0) {
    expect(attendeeUrlValues[0]).toEqual('');
    return;
  }

  const attendees: string[] = attendeeUrlValues[0].split(',');
  expect(attendees).toHaveLength(expectedAttendees.length);

  for (const expectedAttendee of expectedAttendees) {
    expect(attendees).toContain(expectedAttendee);
  }
}

export function validateCalendarDeepLinkStartTime(calendarDeepLink: URL, expectedStartTime?: string): void {
  validateOptionalDeepLinkParameter(calendarDeepLink, teamsDeepLinkStartTimeUrlParameterName, expectedStartTime);
}

export function validateCalendarDeepLinkEndTime(calendarDeepLink: URL, expectedEndTime?: string): void {
  validateOptionalDeepLinkParameter(calendarDeepLink, teamsDeepLinkEndTimeUrlParameterName, expectedEndTime);
}

export function validateCalendarDeepLinkSubject(calendarDeepLink: URL, expectedSubject?: string): void {
  validateOptionalDeepLinkParameter(calendarDeepLink, teamsDeepLinkSubjectUrlParameterName, expectedSubject);
}

export function validateCalendarDeepLinkContent(calendarDeepLink: URL, expectedContent?: string): void {
  validateOptionalDeepLinkParameter(calendarDeepLink, teamsDeepLinkContentUrlParameterName, expectedContent);
}

export function validateAppInstallDialogDeepLink(appInstallDialogDeepLink: URL, expectedAppId: string): void {
  expect(appInstallDialogDeepLink.protocol.toLowerCase()).toEqual(`${teamsDeepLinkProtocol}:`);
  expect(appInstallDialogDeepLink.host.toLowerCase()).toEqual(teamsDeepLinkHost);
  expect(appInstallDialogDeepLink.pathname).toEqual(
    teamsDeepLinkUrlPathForAppInstall + encodeURIComponent(expectedAppId),
  );
  expect(
    decodeURIComponent(appInstallDialogDeepLink.pathname.substring(teamsDeepLinkUrlPathForAppInstall.length)),
  ).toEqual(expectedAppId);
}

function validateOptionalDeepLinkParameter(deepLink: URL, parameterName: string, expectedValue?: string): void {
  const urlValues: string[] = deepLink.searchParams.getAll(parameterName);

  if (expectedValue !== undefined) {
    expect(urlValues).toHaveLength(1);
    expect(urlValues[0]).toEqual(expectedValue);
  } else {
    expect(urlValues).toHaveLength(0);
  }
}

describe('chatUtilities', () => {
  describe('createTeamsDeepLinkForChat', () => {
    const user1 = 'user1';
    const user2 = 'user2first user2last';
    const user3 = 'my name has & special characters in = it';
    const topic = 'this is &= a topic !! with some % characters # that can be $tricky';
    const message = 'a message with &&&& some = ? special + characters in it';

    it('should create a deep link for a single user with no topic and no message', () => {
      const userList: string[] = [user1];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, undefined);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, undefined);
    });

    it('should create a deep link for multiple users with no topic and no message', () => {
      const userList: string[] = [user1, user2, user3];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, undefined);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, undefined);
    });

    it('should create a deep link for one user with the given message', () => {
      const userList: string[] = [user1];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList, undefined, message));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, undefined);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, message);
    });

    it('should create a deep link for multiple users with the given topic', () => {
      const userList: string[] = [user3, user1, user2];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList, topic, undefined));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, topic);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, undefined);
    });

    it('should create a deep link for multiple users with the given topic and message', () => {
      const userList: string[] = [user3, user2, user1];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList, topic, message));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, topic);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, message);
    });

    it('should throw an error when given no users', () => {
      expect.assertions(1);

      expect(() => createTeamsDeepLinkForChat([], topic, message)).toThrowError();
    });
  });
});

describe('callUtilities', () => {
  describe('createTeamsDeepLinkForCall', () => {
    const target1 = 'target1';
    const target2 = 'target2first target2last';
    const target3 = 'my target has & special characters in = it';
    const source = 'a source with &&&& some = ? special + characters in it';

    it('should create a deep link for a single target with no withVideo and no source', () => {
      const targetList: string[] = [target1];
      const generatedCallDeepLinkUrl = new URL(createTeamsDeepLinkForCall(targetList));

      validateCallDeepLinkPrefix(generatedCallDeepLinkUrl);
      validateDeepLinkUsers(generatedCallDeepLinkUrl, targetList);
      validateCallDeepLinkWithVideo(generatedCallDeepLinkUrl, undefined);
      validateCallDeepLinkSource(generatedCallDeepLinkUrl, undefined);
    });

    it('should create a deep link for multiple targets with no withVideo and no source', () => {
      const targetList: string[] = [target1, target2, target3];
      const generatedCallDeepLinkUrl = new URL(createTeamsDeepLinkForCall(targetList));

      validateCallDeepLinkPrefix(generatedCallDeepLinkUrl);
      validateDeepLinkUsers(generatedCallDeepLinkUrl, targetList);
      validateCallDeepLinkWithVideo(generatedCallDeepLinkUrl, undefined);
      validateCallDeepLinkSource(generatedCallDeepLinkUrl, undefined);
    });

    it.each([true, false])('should create a deep link with withVideo set to %s', (withVideo) => {
      const targetList: string[] = [target1, target3];
      const generatedCallDeepLinkUrl = new URL(createTeamsDeepLinkForCall(targetList, withVideo));

      validateCallDeepLinkPrefix(generatedCallDeepLinkUrl);
      validateDeepLinkUsers(generatedCallDeepLinkUrl, targetList);
      validateCallDeepLinkWithVideo(generatedCallDeepLinkUrl, withVideo);
      validateCallDeepLinkSource(generatedCallDeepLinkUrl, undefined);
    });

    it('should create a deep link with the given source containing special characters', () => {
      const targetList: string[] = [target1];
      const generatedCallDeepLinkUrl = new URL(createTeamsDeepLinkForCall(targetList, undefined, source));

      validateCallDeepLinkPrefix(generatedCallDeepLinkUrl);
      validateDeepLinkUsers(generatedCallDeepLinkUrl, targetList);
      validateCallDeepLinkWithVideo(generatedCallDeepLinkUrl, undefined);
      validateCallDeepLinkSource(generatedCallDeepLinkUrl, source);
    });

    it('should create a deep link for multiple targets with the given withVideo and source', () => {
      const targetList: string[] = [target3, target2, target1];
      const generatedCallDeepLinkUrl = new URL(createTeamsDeepLinkForCall(targetList, true, source));

      validateCallDeepLinkPrefix(generatedCallDeepLinkUrl);
      validateDeepLinkUsers(generatedCallDeepLinkUrl, targetList);
      validateCallDeepLinkWithVideo(generatedCallDeepLinkUrl, true);
      validateCallDeepLinkSource(generatedCallDeepLinkUrl, source);
    });

    it('should throw an error when given no targets', () => {
      expect.assertions(1);

      expect(() => createTeamsDeepLinkForCall([], true, source)).toThrowError(
        'Must have at least one target when creating a call deep link',
      );
    });
  });
});

describe('calendarUtilities', () => {
  describe('createTeamsDeepLinkForCalendar', () => {
    const attendee1 = 'attendee1@example.com';
    const attendee2 = 'attendee2first attendee2last';
    const attendee3 = 'my attendee has & special characters in = it';
    const startTime = '2018-03-12T23:55:25+02:00';
    const endTime = '2018-03-13T00:55:25+02:00';
    const subject = 'this is &= a subject !! with some % characters # that can be $tricky';
    const content = 'some content with &&&& = ? special + characters in it';

    it('should create a deep link when given no parameters at all', () => {
      const generatedCalendarDeepLinkUrl = new URL(createTeamsDeepLinkForCalendar());

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateDeepLinkAttendees(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkStartTime(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkEndTime(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkSubject(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkContent(generatedCalendarDeepLinkUrl, undefined);
    });

    it('should create a deep link for a single attendee with no other parameters', () => {
      const attendeeList: string[] = [attendee1];
      const generatedCalendarDeepLinkUrl = new URL(createTeamsDeepLinkForCalendar(attendeeList));

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateDeepLinkAttendees(generatedCalendarDeepLinkUrl, attendeeList);
      validateCalendarDeepLinkStartTime(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkEndTime(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkSubject(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkContent(generatedCalendarDeepLinkUrl, undefined);
    });

    it('should create a deep link for multiple attendees containing special characters', () => {
      const attendeeList: string[] = [attendee1, attendee2, attendee3];
      const generatedCalendarDeepLinkUrl = new URL(createTeamsDeepLinkForCalendar(attendeeList));

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateDeepLinkAttendees(generatedCalendarDeepLinkUrl, attendeeList);
    });

    it('should create a deep link with an empty attendees parameter when given an empty attendee list', () => {
      const generatedCalendarDeepLinkUrl = new URL(createTeamsDeepLinkForCalendar([]));

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateDeepLinkAttendees(generatedCalendarDeepLinkUrl, []);
    });

    it('should create a deep link with the given start time and end time', () => {
      const generatedCalendarDeepLinkUrl = new URL(
        createTeamsDeepLinkForCalendar(undefined, startTime, endTime, undefined, undefined),
      );

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateDeepLinkAttendees(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkStartTime(generatedCalendarDeepLinkUrl, startTime);
      validateCalendarDeepLinkEndTime(generatedCalendarDeepLinkUrl, endTime);
      validateCalendarDeepLinkSubject(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkContent(generatedCalendarDeepLinkUrl, undefined);
    });

    it('should create a deep link with a subject containing special characters', () => {
      const generatedCalendarDeepLinkUrl = new URL(
        createTeamsDeepLinkForCalendar(undefined, undefined, undefined, subject, undefined),
      );

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateCalendarDeepLinkSubject(generatedCalendarDeepLinkUrl, subject);
      validateCalendarDeepLinkContent(generatedCalendarDeepLinkUrl, undefined);
    });

    it('should create a deep link with content containing special characters', () => {
      const generatedCalendarDeepLinkUrl = new URL(
        createTeamsDeepLinkForCalendar(undefined, undefined, undefined, undefined, content),
      );

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateCalendarDeepLinkSubject(generatedCalendarDeepLinkUrl, undefined);
      validateCalendarDeepLinkContent(generatedCalendarDeepLinkUrl, content);
    });

    it('should create a deep link with all parameters set', () => {
      const attendeeList: string[] = [attendee3, attendee2, attendee1];
      const generatedCalendarDeepLinkUrl = new URL(
        createTeamsDeepLinkForCalendar(attendeeList, startTime, endTime, subject, content),
      );

      validateCalendarDeepLinkPrefix(generatedCalendarDeepLinkUrl);
      validateDeepLinkAttendees(generatedCalendarDeepLinkUrl, attendeeList);
      validateCalendarDeepLinkStartTime(generatedCalendarDeepLinkUrl, startTime);
      validateCalendarDeepLinkEndTime(generatedCalendarDeepLinkUrl, endTime);
      validateCalendarDeepLinkSubject(generatedCalendarDeepLinkUrl, subject);
      validateCalendarDeepLinkContent(generatedCalendarDeepLinkUrl, content);
    });
  });
});

describe('appInstallDialogUtilities', () => {
  describe('createTeamsDeepLinkForAppInstallDialog', () => {
    it('should create a deep link for a simple app id', () => {
      const appId = '1542629c-01b3-4a6d-8f76-1938b779e48d';
      const generatedAppInstallDialogDeepLinkUrl = new URL(createTeamsDeepLinkForAppInstallDialog(appId));

      validateAppInstallDialogDeepLink(generatedAppInstallDialogDeepLinkUrl, appId);
    });

    it('should create a deep link for an app id containing special characters', () => {
      const appId = 'app id with & special = characters ? in # it';
      const generatedAppInstallDialogDeepLinkUrl = new URL(createTeamsDeepLinkForAppInstallDialog(appId));

      validateAppInstallDialogDeepLink(generatedAppInstallDialogDeepLinkUrl, appId);
    });

    it('should create a deep link for an app id containing path separators', () => {
      const appId = 'app/id/with/slashes';
      const generatedAppInstallDialogDeepLinkUrl = new URL(createTeamsDeepLinkForAppInstallDialog(appId));

      validateAppInstallDialogDeepLink(generatedAppInstallDialogDeepLinkUrl, appId);
      expect(generatedAppInstallDialogDeepLinkUrl.pathname).toEqual(
        `${teamsDeepLinkUrlPathForAppInstall}app%2Fid%2Fwith%2Fslashes`,
      );
    });

    it('should throw an error when given an empty app id', () => {
      expect.assertions(1);

      expect(() => createTeamsDeepLinkForAppInstallDialog('')).toThrowError(
        'App ID must be set when creating an app install dialog deep link',
      );
    });
  });
});
