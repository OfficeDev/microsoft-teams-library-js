import { meeting } from '../../src/public/meeting';
import { SdkError, ErrorCode } from '../../src/public/interfaces';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FramelessPostMocks } from '../framelessPostMocks';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';

describe('meeting', () => {
  const desktopPlatformMock = new FramelessPostMocks();

  beforeEach(() => {
    desktopPlatformMock.messages = [];
    _initialize(desktopPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('toggleIncomingClientAudio', () => {
    it('should not allow toggle incoming client audio calls with null callback', () => {
      expect(() => meeting.toggleIncomingClientAudio(null)).toThrowError(
        '[toggle incoming client audio] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.toggleIncomingClientAudio(() => {
          return;
        })
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully toggle the incoming client audio', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedResult: boolean | null;
      meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
        callbackCalled = true;
        returnedResult = result;
        returnedSdkError = error;
      });

      let toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      let callbackId = toggleIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).toBeNull();
      expect(returnedResult).toBe(true);
    });

    it('should return error code 500', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedResult: boolean | null;
      meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
        callbackCalled = true;
        returnedResult = result;
        returnedSdkError = error;
      });

      let toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc("toggleIncomingClientAudio");
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      let callbackId = toggleIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null]
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).not.toBeNull();
      expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      expect(returnedResult).toBe(null);
    });
  });
  describe('getIncomingClientAudioState', () => {
    it('should not allow get incoming client audio calls with null callback', () => {
      expect(() => meeting.getIncomingClientAudioState(null)).toThrowError(
        '[get incoming client audio state] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getIncomingClientAudioState(() => {
          return;
        })
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the incoming client audio state', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedResult: boolean | null;
      meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
        callbackCalled = true;
        returnedResult = result;
        returnedSdkError = error;
      });

      let getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc("getIncomingClientAudioState");
      expect(getIncomingClientAudioMessage).not.toBeNull();
      let callbackId = getIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).toBeNull();
      expect(returnedResult).toBe(true);
    });

    it('should return error code 500', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedResult: boolean | null;
      meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
        callbackCalled = true;
        returnedResult = result;
        returnedSdkError = error;
      });

      let getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc("getIncomingClientAudioState");
      expect(getIncomingClientAudioMessage).not.toBeNull();
      let callbackId = getIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null]
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).not.toBeNull();
      expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      expect(returnedResult).toBe(null);
    });
  });
  describe('getMeetingDetails', () => {
    it('should not allow get meeting details calls with null callback', () => {
      expect(() => meeting.getMeetingDetails(null)).toThrowError('[get meeting details] Callback cannot be null');
    });
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getMeetingDetails(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the meeting details', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedMeetingResult: meeting.IMeetingDetails | null;
      meeting.getMeetingDetails((error: SdkError, meetingDetails: meeting.IMeetingDetails) => {
        callbackCalled = true;
        returnedMeetingResult = meetingDetails;
        returnedSdkError = error;
      });

      let getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
      expect(getMeetingDetailsMessage).not.toBeNull();
      let callbackId = getMeetingDetailsMessage.id;
      const details: meeting.IDetails = {
        id: `mockObjectId`,
        scheduledStartTime: '2020-12-21T21:30:00+00:00',
        scheduledEndTime: '2020-12-21T22:00:00+00:00',
        joinUrl:
          'https://teams.microsoft.com/l/meetup-join/19%3ameeting_qwertyuiop[phgfdsasdfghjkjbvcxcvbnmyt1234567890!@#$%^&*(%40thread.v2/0?context=%7b%22Tid%22%3a%2272f988bf-86f1-41af-91ab-2d7cd011db47%22%2c%22Oid%22%3a%226b33ac33-85ae-4995-be29-1d38a77aa8e3%22%7d',
        title: 'Get meeting details test meeting',
        type: meeting.MeetingType.Scheduled,
      };
      const organizer: meeting.IOrganizer = {
        id: '8:orgid:6b33ac33-85ae-4995-be29-1d38a77aa8e3',
        tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      };
      const conversation: meeting.IConversation = {
        id: `convId`,
      };
      const meetingDetails: meeting.IMeetingDetails = {
        details,
        conversation,
        organizer,
      }​​​​;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, meetingDetails],
        },
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).toBeNull();
      expect(returnedMeetingResult).toStrictEqual(meetingDetails);
    });

    it('should return error code 500', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedMeetingDetails: meeting.IMeetingDetails | null;
      meeting.getMeetingDetails((error: SdkError, meetingDetails: meeting.IMeetingDetails) => {
        callbackCalled = true;
        returnedMeetingDetails = meetingDetails;
        returnedSdkError = error;
      });

      let getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
      expect(getMeetingDetailsMessage).not.toBeNull();
      let callbackId = getMeetingDetailsMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).not.toBeNull();
      expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      expect(returnedMeetingDetails).toBe(null);
    });
  });
  describe('getAuthenticationTokenForAnonymousUser', () => {
    it('should not allow get anonymous user token with null callback', () => {
      expect(() => meeting.getAuthenticationTokenForAnonymousUser(null)).toThrowError(
        '[get Authentication Token For AnonymousUser] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getAuthenticationTokenForAnonymousUser(() => {
          return;
        })
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the anonymous user token of the user in meeting', () => {
      desktopPlatformMock.initializeWithContext('content');

      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedSkypeToken: string | null;
      meeting.getAuthenticationTokenForAnonymousUser((error: SdkError, authenticationTokenOfAnonymousUser: string) => {
        callbackCalled = true;
        returnedSkypeToken = authenticationTokenOfAnonymousUser;
        returnedSdkError = error;
      });

      let getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAuthenticationTokenForAnonymousUser',
      );
      expect(getAnonymousUserTokenMessage).not.toBeNull();
      let callbackId = getAnonymousUserTokenMessage.id;
      let mockAuthenticationToken = '1234567890oiuytrdeswasdcfvbgnhjmuy6t54ewsxdcvbnu743edfvbnm,o98';
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, mockAuthenticationToken],
        },
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).toBeNull();
      expect(returnedSkypeToken).toBe(mockAuthenticationToken);
    });
    it('should return error code 500', () => {
      desktopPlatformMock.initializeWithContext('content');
      let callbackCalled = false;
      let returnedSdkError: SdkError | null;
      let returnedSkypeToken: string | null;
      meeting.getAuthenticationTokenForAnonymousUser((error: SdkError, authenticationTokenOfAnonymousUser: string) => {
        callbackCalled = true;
        returnedSkypeToken = authenticationTokenOfAnonymousUser;
        returnedSdkError = error;
      });

      let getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAuthenticationTokenForAnonymousUser',
      );
      expect(getAnonymousUserTokenMessage).not.toBeNull();
      let callbackId = getAnonymousUserTokenMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null]
        }
      } as DOMMessageEvent);
      expect(callbackCalled).toBe(true);
      expect(returnedSdkError).not.toBeNull();
      expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      expect(returnedSkypeToken).toBe(null);
    });
  });
});
