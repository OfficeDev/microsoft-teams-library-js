import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { meeting } from '../../src/public/meeting';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('meeting', () => {
  const framelessPlatformMock = new FramelessPostMocks();
  const framedPlatformMock = new Utils();

  beforeEach(() => {
    framelessPlatformMock.messages = [];
    framedPlatformMock.messages = [];
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  const emptyCallBack = (): void => {
    return;
  };
  describe('toggleIncomingClientAudio', () => {
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    it('should not allow toggle incoming client audio calls with null callback', () => {
      expect(() => meeting.toggleIncomingClientAudio(null)).toThrowError(
        '[toggle incoming client audio] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.toggleIncomingClientAudio(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully send the toggleIncomingClientAudio message. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          meeting.toggleIncomingClientAudio(emptyCallBack);
          const toggleIncomingClientAudioMessage = framelessPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
          expect(toggleIncomingClientAudioMessage).not.toBeNull();
          expect(toggleIncomingClientAudioMessage.args.length).toEqual(0);
        });

        it(`should successfully toggle the incoming client audio context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          });

          const toggleIncomingClientAudioMessage = framelessPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
          expect(toggleIncomingClientAudioMessage).not.toBeNull();
          const callbackId = toggleIncomingClientAudioMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, true],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedResult).toBe(true);
        });

        it(`should throw if the toggleIncomingClientAudio message sends and fails context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          });

          const toggleIncomingClientAudioMessage = framelessPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
          expect(toggleIncomingClientAudioMessage).not.toBeNull();
          const callbackId = toggleIncomingClientAudioMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedResult).toBe(null);
        });
      } else {
        it(`should not allow meeting.toggleIncomingClientAudio calls from ${context} context`, async () => {
          //
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.toggleIncomingClientAudio(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('getIncomingClientAudioState', () => {
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getIncomingClientAudioState(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow get incoming client audio calls with null callback', () => {
      expect(() => meeting.getIncomingClientAudioState(null)).toThrowError(
        '[get incoming client audio state] Callback cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully get the incoming client audio state. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          });

          const getIncomingClientAudioMessage = framelessPlatformMock.findMessageByFunc('getIncomingClientAudioState');
          expect(getIncomingClientAudioMessage).not.toBeNull();
          const callbackId = getIncomingClientAudioMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, true],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedResult).toBe(true);
        });

        it(`should throw if the getIncomingClientAudioState message sends and fails ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          });

          const getIncomingClientAudioMessage = framelessPlatformMock.findMessageByFunc('getIncomingClientAudioState');
          expect(getIncomingClientAudioMessage).not.toBeNull();
          const callbackId = getIncomingClientAudioMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedResult).toBe(null);
        });
      } else {
        it(`should not allow meeting.getIncomingClientAudioState calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.getIncomingClientAudioState(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('getMeetingDetails', () => {
    it('should not allow get meeting details calls with null callback', () => {
      expect(() => meeting.getMeetingDetails(null)).toThrowError('[get meeting details] Callback cannot be null');
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getMeetingDetails(emptyCallBack)).toThrowError(new Error(errorLibraryNotInitialized));
    });
    const allowedContexts = [
      FrameContexts.sidePanel,
      FrameContexts.meetingStage,
      FrameContexts.settings,
      FrameContexts.content,
    ];

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully get the meeting details. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedMeetingResult: meeting.IMeetingDetailsResponse | null;
          meeting.getMeetingDetails((error: SdkError, meetingDetails: meeting.IMeetingDetailsResponse) => {
            callbackCalled = true;
            returnedMeetingResult = meetingDetails;
            returnedSdkError = error;
          });

          const getMeetingDetailsMessage = framelessPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
          expect(getMeetingDetailsMessage).not.toBeNull();
          const callbackId = getMeetingDetailsMessage.id;
          const details: meeting.IMeetingDetails = {
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
            id: 'convId',
          };
          const meetingDetails: meeting.IMeetingDetailsResponse = {
            details,
            conversation,
            organizer,
          };
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, meetingDetails],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedMeetingResult).toStrictEqual(meetingDetails);
        });

        it(`should throw if the getMeetingDetails message sends and fails. context: ${context} `, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedMeetingDetails: meeting.IMeetingDetailsResponse | null;
          meeting.getMeetingDetails((error: SdkError, meetingDetails: meeting.IMeetingDetailsResponse) => {
            callbackCalled = true;
            returnedMeetingDetails = meetingDetails;
            returnedSdkError = error;
          });

          const getMeetingDetailsMessage = framelessPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
          expect(getMeetingDetailsMessage).not.toBeNull();
          const callbackId = getMeetingDetailsMessage.id;
          framelessPlatformMock.respondToMessage({
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
      } else {
        it(`should not allow meeting.getMeetingDetails calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.getMeetingDetails(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('getAuthenticationTokenForAnonymousUser', () => {
    it('should not allow get anonymous user token with null callback', () => {
      expect(() => meeting.getAuthenticationTokenForAnonymousUser(null)).toThrowError(
        '[get Authentication Token For AnonymousUser] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getAuthenticationTokenForAnonymousUser(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.task];

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully send the getAuthenticationTokenForAnonymousUser message. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedSkypeToken: string | null;
          meeting.getAuthenticationTokenForAnonymousUser(
            (error: SdkError, authenticationTokenOfAnonymousUser: string) => {
              callbackCalled = true;
              returnedSkypeToken = authenticationTokenOfAnonymousUser;
              returnedSdkError = error;
            },
          );

          const getAnonymousUserTokenMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.getAuthenticationTokenForAnonymousUser',
          );
          expect(getAnonymousUserTokenMessage).not.toBeNull();
          const callbackId = getAnonymousUserTokenMessage.id;
          const mockAuthenticationToken = '1234567890oiuytrdeswasdcfvbgnhjmuy6t54ewsxdcvbnu743edfvbnm,o98';
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, mockAuthenticationToken],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedSkypeToken).toBe(mockAuthenticationToken);
        });

        it(`should throw if the getAuthenticationTokenForAnonymousUser message sends and fails. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedSkypeToken: string | null;
          meeting.getAuthenticationTokenForAnonymousUser(
            (error: SdkError, authenticationTokenOfAnonymousUser: string) => {
              callbackCalled = true;
              returnedSkypeToken = authenticationTokenOfAnonymousUser;
              returnedSdkError = error;
            },
          );

          const getAnonymousUserTokenMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.getAuthenticationTokenForAnonymousUser',
          );
          expect(getAnonymousUserTokenMessage).not.toBeNull();
          const callbackId = getAnonymousUserTokenMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedSkypeToken).toBe(null);
        });
      } else {
        it(`should not allow meeting.getAuthenticationTokenForAnonymousUser calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.getAuthenticationTokenForAnonymousUser(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('getLiveStreamState', () => {
    const allowedContexts = [FrameContexts.sidePanel];
    it('should fail when called with a null callback', () => {
      expect(() => meeting.getLiveStreamState(null)).toThrowError('[get live stream state] Callback cannot be null');
    });
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.getLiveStreamState(emptyCallBack)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully get live stream state. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedLiveStreamState: meeting.LiveStreamState | null;

          meeting.getLiveStreamState((error: SdkError, liveStreamState: meeting.LiveStreamState) => {
            callbackCalled = true;
            returnedSdkError = error;
            returnedLiveStreamState = liveStreamState;
          });

          const getLiveStreamStateMessage = framelessPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
          expect(getLiveStreamStateMessage).not.toBeNull();

          const callbackId = getLiveStreamStateMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, { isStreaming: true }],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBe(null);
          expect(returnedLiveStreamState).not.toBeNull();
          expect(returnedLiveStreamState).toEqual({ isStreaming: true });
        });

        it(`should throw if the getLiveStreamState message sends and fails. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedLiveStreamState: meeting.LiveStreamState | null;

          meeting.getLiveStreamState((error: SdkError, liveStreamState: meeting.LiveStreamState) => {
            callbackCalled = true;
            returnedSdkError = error;
            returnedLiveStreamState = liveStreamState;
          });

          const getLiveStreamStateMessage = framelessPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
          expect(getLiveStreamStateMessage).not.toBeNull();

          const callbackId = getLiveStreamStateMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedLiveStreamState).toBe(null);
        });
      } else {
        it(`should not allow meeting.getLiveStreamState calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.getLiveStreamState(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('requestStartLiveStreaming', () => {
    it('should fail when called with a null callback', () => {
      expect(() => meeting.requestStartLiveStreaming(null, 'streamurl', 'streamkey')).toThrowError(
        '[request start live streaming] Callback cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() => meeting.requestStartLiveStreaming(emptyCallBack, 'streamurl', 'streamkey')).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('should throw if the requestStartLiveStreaming message sends and fails', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;

          meeting.requestStartLiveStreaming(
            (error: SdkError) => {
              callbackCalled = true;
              returnedSdkError = error;
            },
            'streamurl',
            'streamkey',
          );

          const requestStartLiveStreamMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestStartLiveStreaming',
          );
          expect(requestStartLiveStreamMessage).not.toBeNull();

          const callbackId = requestStartLiveStreamMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, { isStreaming: true }],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBe(null);
          expect(requestStartLiveStreamMessage.args).toEqual(['streamurl', 'streamkey']);
        });

        it(`should successfully request start live streaming context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;

          meeting.requestStartLiveStreaming(
            (error: SdkError) => {
              callbackCalled = true;
              returnedSdkError = error;
            },
            'streamurl',
            'streamkey',
          );

          const requestStartLiveStreamMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestStartLiveStreaming',
          );
          expect(requestStartLiveStreamMessage).not.toBeNull();

          const callbackId = requestStartLiveStreamMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, { isStreaming: true }],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBe(null);
          expect(requestStartLiveStreamMessage.args).toEqual(['streamurl', 'streamkey']);
        });
      } else {
        it(`should not allow meeting.requestStartLiveStreaming calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.requestStartLiveStreaming(emptyCallBack, 'streamurl', 'streamkey')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('requestStopLiveStreaming', () => {
    it('should fail when called with a null callback', () => {
      expect(() => meeting.requestStopLiveStreaming(null)).toThrowError(
        '[request stop live streaming] Callback cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() => meeting.requestStopLiveStreaming(emptyCallBack)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('should throw if the requestStopLiveStreaming message sends and fails', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;

          meeting.requestStopLiveStreaming((error: SdkError) => {
            callbackCalled = true;
            returnedSdkError = error;
          });

          const requestStopLiveStreamingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestStopLiveStreaming',
          );
          expect(requestStopLiveStreamingMessage).not.toBeNull();

          const callbackId = requestStopLiveStreamingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        });

        it(`should successfully send the meeting.requestStopLiveStreaming call context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;

          meeting.requestStopLiveStreaming((error: SdkError) => {
            callbackCalled = true;
            returnedSdkError = error;
          });

          const requestStopLiveStreamingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestStopLiveStreaming',
          );
          expect(requestStopLiveStreamingMessage).not.toBeNull();

          const callbackId = requestStopLiveStreamingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, { isStreaming: false }],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBe(null);
        });
      } else {
        it(`should not allow meeting.requestStopLiveStreaming calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.requestStopLiveStreaming(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('registerLiveStreamChangedHandler', () => {
    it('should fail when called without a handler', () => {
      expect(() => meeting.registerLiveStreamChangedHandler(null)).toThrowError(
        '[register live stream changed handler] Handler cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() => meeting.registerLiveStreamChangedHandler(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('should successfully register a handler for when live stream is changed', async () => {
          await framedPlatformMock.initializeWithContext(context);

          let handlerCalled = false;
          let returnedLiveStreamState: meeting.LiveStreamState | null;

          meeting.registerLiveStreamChangedHandler((liveStreamState: meeting.LiveStreamState) => {
            handlerCalled = true;
            returnedLiveStreamState = liveStreamState;
          });

          framedPlatformMock.sendMessage('meeting.liveStreamChanged', { isStreaming: true });

          expect(handlerCalled).toBe(true);
          expect(returnedLiveStreamState).not.toBeNull();
          expect(returnedLiveStreamState).toEqual({ isStreaming: true });
        });
      } else {
        it(`should not allow meeting.registerLiveStreamChangedHandler calls from ${context} context`, async () => {
          await framedPlatformMock.initializeWithContext(context);

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => meeting.registerLiveStreamChangedHandler(() => {})).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('shareAppContentToStage', () => {
    it('should not allow to share app content to stage with null callback', () => {
      expect(() => meeting.shareAppContentToStage(null, '')).toThrowError(
        '[share app content to stage] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.shareAppContentToStage(emptyCallBack, '')).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully share app content to stage. content: ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          const requestUrl = 'validUrl';
          meeting.shareAppContentToStage((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          }, requestUrl);

          const shareAppContentToStageMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.shareAppContentToStage',
          );
          expect(shareAppContentToStageMessage).not.toBeNull();
          const callbackId = shareAppContentToStageMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, true],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedResult).toBe(true);
          expect(shareAppContentToStageMessage.args).toContain(requestUrl);
        });

        it('should throw if the shareAppContentToStage message sends and fails', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          const requestUrl = 'invalidAppUrl';
          meeting.shareAppContentToStage((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          }, requestUrl);

          const shareAppContentToStageMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.shareAppContentToStage',
          );
          expect(shareAppContentToStageMessage).not.toBeNull();
          const callbackId = shareAppContentToStageMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedResult).toBe(null);
          expect(shareAppContentToStageMessage.args).toContain(requestUrl);
        });
      } else {
        it(`should not allow meeting.shareAppContentToStage calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.shareAppContentToStage(emptyCallBack, '')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('getAppContentStageSharingCapabilities', () => {
    it('should throw error if callback is not provided', () => {
      expect(() => meeting.getAppContentStageSharingCapabilities(null)).toThrowError(
        '[get app content stage sharing capabilities] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getAppContentStageSharingCapabilities(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('should successfully send the getAppContentStageSharingCapabilities message.', async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: meeting.IAppContentStageSharingCapabilities | null;
          meeting.getAppContentStageSharingCapabilities(
            (error: SdkError, appContentStageSharingCapabilities: meeting.IAppContentStageSharingCapabilities) => {
              callbackCalled = true;
              returnedSdkError = error;
              returnedResult = appContentStageSharingCapabilities;
            },
          );

          const appContentStageSharingCapabilities = {
            doesAppHaveSharePermission: true,
          };

          const appContentStageSharingCapabilitiesMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.getAppContentStageSharingCapabilities',
          );
          expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
          const callbackId = appContentStageSharingCapabilitiesMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, appContentStageSharingCapabilities],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedResult).toStrictEqual(appContentStageSharingCapabilities);
        });

        it('should return correct error information', async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: meeting.IAppContentStageSharingCapabilities | null;
          meeting.getAppContentStageSharingCapabilities(
            (error: SdkError, appContentStageSharingCapabilities: meeting.IAppContentStageSharingCapabilities) => {
              callbackCalled = true;
              returnedSdkError = error;
              returnedResult = appContentStageSharingCapabilities;
            },
          );

          const appContentStageSharingCapabilitiesMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.getAppContentStageSharingCapabilities',
          );
          expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
          const callbackId = appContentStageSharingCapabilitiesMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedResult).toBe(null);
        });
      } else {
        it(`should not allow meeting.getAppContentStageSharingCapabilities calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.getAppContentStageSharingCapabilities(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('stopSharingAppContentToStage', () => {
    it('should not allow to terminate stage sharing session with null callback', () => {
      expect(() => meeting.stopSharingAppContentToStage(null)).toThrowError(
        '[stop sharing app content to stage] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.stopSharingAppContentToStage(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully terminate app content stage sharing session. context: ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          meeting.stopSharingAppContentToStage((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          });

          const stopSharingAppContentToStageMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.stopSharingAppContentToStage',
          );
          expect(stopSharingAppContentToStageMessage).not.toBeNull();
          const callbackId = stopSharingAppContentToStageMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, true],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedResult).toBe(true);
        });

        it('should throw if the stopSharingAppContentToStage message sends and fails', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: boolean | null;
          meeting.stopSharingAppContentToStage((error: SdkError, result: boolean) => {
            callbackCalled = true;
            returnedResult = result;
            returnedSdkError = error;
          });

          const stopSharingAppContentToStageMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.stopSharingAppContentToStage',
          );
          expect(stopSharingAppContentToStageMessage).not.toBeNull();
          const callbackId = stopSharingAppContentToStageMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedResult).toBe(null);
        });
      } else {
        it(`should not allow meeting.stopSharingAppContentToStage calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.stopSharingAppContentToStage(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('getAppContentStageSharingState', () => {
    it('should throw error if callback is not provided', () => {
      expect(() => meeting.getAppContentStageSharingState(null)).toThrowError(
        '[get app content stage sharing state] Callback cannot be null',
      );
    });
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getAppContentStageSharingState(emptyCallBack)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully get current stage sharing state information. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: meeting.IAppContentStageSharingState | null;
          meeting.getAppContentStageSharingState(
            (error: SdkError, appContentStageSharingState: meeting.IAppContentStageSharingState) => {
              callbackCalled = true;
              returnedSdkError = error;
              returnedResult = appContentStageSharingState;
            },
          );

          const appContentStageSharingState = {
            isAppSharing: true,
          };

          const appContentStageSharingStateMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.getAppContentStageSharingState',
          );
          expect(appContentStageSharingStateMessage).not.toBeNull();
          const callbackId = appContentStageSharingStateMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, appContentStageSharingState],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).toBeNull();
          expect(returnedResult).toStrictEqual(appContentStageSharingState);
        });

        it('should throw if the getAppContentStageSharingState message sends and fails', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          let callbackCalled = false;
          let returnedSdkError: SdkError | null;
          let returnedResult: meeting.IAppContentStageSharingState | null;
          meeting.getAppContentStageSharingState(
            (error: SdkError, appContentStageSharingState: meeting.IAppContentStageSharingState) => {
              callbackCalled = true;
              returnedSdkError = error;
              returnedResult = appContentStageSharingState;
            },
          );

          const appContentStageSharingStateMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.getAppContentStageSharingState',
          );
          expect(appContentStageSharingStateMessage).not.toBeNull();
          const callbackId = appContentStageSharingStateMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
            },
          } as DOMMessageEvent);

          expect(callbackCalled).toBe(true);
          expect(returnedSdkError).not.toBeNull();
          expect(returnedSdkError).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(returnedResult).toBe(null);
        });
      } else {
        it(`should not allow meeting.getAppContentStageSharingState calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => meeting.getAppContentStageSharingState(emptyCallBack)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('registerSpeakingStateChangeHandler', () => {
    it('should fail when called without a handler', () => {
      expect(() => meeting.registerSpeakingStateChangeHandler(null)).toThrowError(
        '[registerSpeakingStateChangeHandler] Handler cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() =>
        meeting.registerSpeakingStateChangeHandler(() => {
          return;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully register a handler for when the array of participants speaking changes and frameContext=sidePanel', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const speakingState: meeting.ISpeakingState = { isSpeakingDetected: true };

      let handlerCalled = false;
      let returnedSpeakingState: meeting.ISpeakingState | null;

      meeting.registerSpeakingStateChangeHandler((speakingState: meeting.ISpeakingState) => {
        handlerCalled = true;
        returnedSpeakingState = speakingState;
      });

      const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage.args.length).toBe(1);
      expect(registerHandlerMessage.args[0]).toBe('meeting.speakingStateChanged');

      framelessPlatformMock.respondToMessage({
        data: {
          func: 'meeting.speakingStateChanged',
          args: [speakingState],
        },
      } as DOMMessageEvent);

      expect(handlerCalled).toBeTruthy();
      expect(returnedSpeakingState).toBe(speakingState);
    });

    it('should successfully register a handler for when the array of participants speaking changes and frameContext=meetingStage', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.meetingStage);
      const speakingState: meeting.ISpeakingState = { isSpeakingDetected: true };

      let handlerCalled = false;
      let returnedSpeakingState: meeting.ISpeakingState | null;

      meeting.registerSpeakingStateChangeHandler((eventData: meeting.ISpeakingState) => {
        handlerCalled = true;
        returnedSpeakingState = eventData;
      });

      const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage.args.length).toBe(1);
      expect(registerHandlerMessage.args[0]).toBe('meeting.speakingStateChanged');

      framelessPlatformMock.respondToMessage({
        data: {
          func: 'meeting.speakingStateChanged',
          args: [speakingState],
        },
      } as DOMMessageEvent);

      expect(handlerCalled).toBeTruthy();
      expect(returnedSpeakingState).toBe(speakingState);
    });
  });

  describe('registerRaiseHandStateChangedHandler', () => {
    it('should fail when called without a handler', () => {
      expect(() => meeting.registerRaiseHandStateChangedHandler(null)).toThrowError(
        '[registerRaiseHandStateChangedHandler] Handler cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() =>
        meeting.registerRaiseHandStateChangedHandler(() => {
          return;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully register a handler for when the raiseHandState changes and frameContext=sidePanel', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const raiseHandState: meeting.RaiseHandStateChangedEventData = {
        raiseHandState: { isHandRaised: true },
      };

      let handlerCalled = false;
      let response: meeting.RaiseHandStateChangedEventData;

      meeting.registerRaiseHandStateChangedHandler((eventData: meeting.RaiseHandStateChangedEventData) => {
        handlerCalled = true;
        response = eventData;
      });

      const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage.args.length).toBe(1);
      expect(registerHandlerMessage.args[0]).toBe('meeting.raiseHandStateChanged');

      framelessPlatformMock.respondToMessage({
        data: {
          func: 'meeting.raiseHandStateChanged',
          args: [raiseHandState],
        },
      } as DOMMessageEvent);

      expect(handlerCalled).toBeTruthy();
      expect(response).toBe(raiseHandState);
    });

    it('should successfully register a handler for when the raiseHandState changes and frameContext=meetingStage', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.meetingStage);
      const raiseHandState: meeting.RaiseHandStateChangedEventData = {
        raiseHandState: { isHandRaised: true },
      };

      let handlerCalled = false;
      let response: meeting.RaiseHandStateChangedEventData;

      meeting.registerRaiseHandStateChangedHandler((eventData: meeting.RaiseHandStateChangedEventData) => {
        handlerCalled = true;
        response = eventData;
      });

      const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage.args.length).toBe(1);
      expect(registerHandlerMessage.args[0]).toBe('meeting.raiseHandStateChanged');

      framelessPlatformMock.respondToMessage({
        data: {
          func: 'meeting.raiseHandStateChanged',
          args: [raiseHandState],
        },
      } as DOMMessageEvent);

      expect(handlerCalled).toBeTruthy();
      expect(response).toBe(raiseHandState);
    });
  });

  describe('registerRaiseHandStateChangedHandler', () => {
    it('should fail when called without a handler', () => {
      expect(() => meeting.registerMeetingReactionReceivedHandler(null)).toThrowError(
        '[registerMeetingReactionReceivedHandler] Handler cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() =>
        meeting.registerMeetingReactionReceivedHandler(() => {
          return;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully register a handler for when a meetingReaction is received and frameContext=sidePanel', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const meetingReaction: meeting.MeetingReactionReceivedEventData = {
        meetingReactionType: meeting.MeetingReactionType.like,
      };

      let handlerCalled = false;
      let response: meeting.MeetingReactionReceivedEventData;

      meeting.registerMeetingReactionReceivedHandler((eventData: meeting.MeetingReactionReceivedEventData) => {
        handlerCalled = true;
        response = eventData;
      });

      const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage.args.length).toBe(1);
      expect(registerHandlerMessage.args[0]).toBe('meeting.meetingReactionReceived');

      framelessPlatformMock.respondToMessage({
        data: {
          func: 'meeting.meetingReactionReceived',
          args: [meetingReaction],
        },
      } as DOMMessageEvent);

      expect(handlerCalled).toBeTruthy();
      expect(response).toBe(meetingReaction);
    });

    it('should successfully register a handler for when a meetingReaction is received and frameContext=meetingStage', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.meetingStage);
      const meetingReaction: meeting.MeetingReactionReceivedEventData = {
        meetingReactionType: meeting.MeetingReactionType.like,
      };

      let handlerCalled = false;
      let response: meeting.MeetingReactionReceivedEventData;

      meeting.registerMeetingReactionReceivedHandler((eventData: meeting.MeetingReactionReceivedEventData) => {
        handlerCalled = true;
        response = eventData;
      });

      const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage.args.length).toBe(1);
      expect(registerHandlerMessage.args[0]).toBe('meeting.meetingReactionReceived');

      framelessPlatformMock.respondToMessage({
        data: {
          func: 'meeting.meetingReactionReceived',
          args: [meetingReaction],
        },
      } as DOMMessageEvent);

      expect(handlerCalled).toBeTruthy();
      expect(response).toBe(meetingReaction);
    });
  });

  describe('setOptions', () => {
    let contentUrl = 'https://www.test.com';
    let shareInformation: meeting.appShareButton.ShareInformation = {
      isVisible: false,
      contentUrl: contentUrl,
    };
    it('meeting.appShareButton.setOptions should not allow calls before initialization', () => {
      expect(() => meeting.appShareButton.setOptions(shareInformation)).toThrowError(
        'The library has not yet been initialized',
      );
    });
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully set shareInformation. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          meeting.appShareButton.setOptions(shareInformation);
          const toggleAppShareButtonMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.appShareButton.setOptions',
          );
          expect(toggleAppShareButtonMessage).not.toBeNull();
          expect(toggleAppShareButtonMessage.args.length).toBe(1);
          expect(toggleAppShareButtonMessage.args[0]).toStrictEqual(shareInformation);
        });

        it(`should successfully set false isVisible and contentUrl to be bad Url. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let invalidUrl = 'www.xyz.com';
          shareInformation.contentUrl = invalidUrl;
          expect(() => meeting.appShareButton.setOptions(shareInformation)).toThrowError(`Invalid URL: ${invalidUrl}`);
        });

        it(`should successfully set false isVisible and contentUrl to be undefined. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          let newShareInformation: meeting.appShareButton.ShareInformation = {
            isVisible: false,
          };
          meeting.appShareButton.setOptions(newShareInformation);
          const toggleAppShareButtonMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.appShareButton.setOptions',
          );
          expect(toggleAppShareButtonMessage).not.toBeNull();
          expect(toggleAppShareButtonMessage.args.length).toBe(1);
          expect(toggleAppShareButtonMessage.args[0].isVisible).toBe(false);
          expect(toggleAppShareButtonMessage.args[0].contentUrl).toBe(undefined);
        });
      } else {
        it(`should not successfully shareInformation. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          shareInformation.contentUrl = contentUrl;
          expect(() => meeting.appShareButton.setOptions(shareInformation)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('requestAppAudioHandling', () => {
    const emptyMicStateCallback = (micState: meeting.MicState) => Promise.resolve(micState);
    const waitForEventQueue = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('should not allow call with null callback response', () => {
      expect(() =>
        meeting.requestAppAudioHandling(
          { isAppHandlingAudio: true, micMuteStateChangedCallback: emptyMicStateCallback },
          null,
        ),
      ).toThrowError('[requestAppAudioHandling] Callback response cannot be null');
    });
    it('should not allow call with null callback mic mute handler', () => {
      expect(() =>
        meeting.requestAppAudioHandling({ isAppHandlingAudio: true, micMuteStateChangedCallback: null }, emptyCallBack),
      ).toThrowError('[requestAppAudioHandling] Callback Mic mute state handler cannot be null');
    });
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.requestAppAudioHandling(
          { isAppHandlingAudio: true, micMuteStateChangedCallback: emptyMicStateCallback },
          emptyCallBack,
        ),
      ).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should successfully return isHostAudioless=true for app audio handling request. context: ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const requestIsHostAudioless: boolean | null = true;

          let callbackCalled = false;
          let returnedIsHostAudioless: boolean | null = false;
          meeting.requestAppAudioHandling(
            { isAppHandlingAudio: true, micMuteStateChangedCallback: emptyMicStateCallback },
            (result: boolean) => {
              callbackCalled = true;
              returnedIsHostAudioless = result;
            },
          );

          const requestAppAudioHandlingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestAppAudioHandling',
          );
          expect(requestAppAudioHandlingMessage).not.toBeNull();

          const callbackId = requestAppAudioHandlingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, requestIsHostAudioless],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedIsHostAudioless).not.toBeNull();
          expect(returnedIsHostAudioless).toBe(requestIsHostAudioless);
        });

        it(`should successfully return isHostAudioless=false for app audio handling stop request. context: ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const requestIsHostAudioless: boolean | null = false;

          let callbackCalled = false;
          let returnedIsHostAudioless: boolean | null = false;
          meeting.requestAppAudioHandling(
            { isAppHandlingAudio: false, micMuteStateChangedCallback: emptyMicStateCallback },
            (result: boolean) => {
              callbackCalled = true;
              returnedIsHostAudioless = result;
            },
          );

          const requestAppAudioHandlingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestAppAudioHandling',
          );
          expect(requestAppAudioHandlingMessage).not.toBeNull();

          const callbackId = requestAppAudioHandlingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, requestIsHostAudioless],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
          expect(returnedIsHostAudioless).not.toBeNull();
          expect(returnedIsHostAudioless).toBe(requestIsHostAudioless);
        });

        it(`should call meeting.micStateChanged after meeting.requestAppAudioHandling. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const requestIsHostAudioless: boolean | null = true;

          let micCallbackCalled = false;
          const testMicStateCallback = (micState: meeting.MicState) => {
            micCallbackCalled = true;
            return Promise.resolve(micState);
          };

          // call and respond to requestAppAudioHandling
          meeting.requestAppAudioHandling(
            { isAppHandlingAudio: requestIsHostAudioless, micMuteStateChangedCallback: testMicStateCallback },
            (_result: boolean) => {},
          );
          const requestAppAudioHandlingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestAppAudioHandling',
          );
          expect(requestAppAudioHandlingMessage).not.toBeNull();

          const callbackId = requestAppAudioHandlingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, requestIsHostAudioless],
            },
          } as DOMMessageEvent);

          // check that the registerHandler for mic state was called
          const registerHandlerMessage = framelessPlatformMock.findMessageByFunc('registerHandler');
          expect(registerHandlerMessage).not.toBeNull();
          expect(registerHandlerMessage.args.length).toBe(1);
          expect(registerHandlerMessage.args[0]).toBe('meeting.micStateChanged');

          // respond to the registerHandler
          framelessPlatformMock.respondToMessage({
            data: {
              func: 'meeting.micStateChanged',
              args: [{ isMicMuted: true }],
            },
          } as DOMMessageEvent);
          await waitForEventQueue();

          expect(micCallbackCalled).toBe(true);
        });

        it(`should call meeting.updateMicState with HostInitiated reason when mic state matches. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const requestIsHostAudioless: boolean | null = true;

          const micStateCallbackSameValue = (micState: meeting.MicState) => Promise.resolve(micState);

          // call and respond to requestAppAudioHandling
          meeting.requestAppAudioHandling(
            {
              isAppHandlingAudio: requestIsHostAudioless,
              micMuteStateChangedCallback: micStateCallbackSameValue,
            },
            (_result: boolean) => {},
          );
          const requestAppAudioHandlingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestAppAudioHandling',
          );
          expect(requestAppAudioHandlingMessage).not.toBeNull();

          const callbackId = requestAppAudioHandlingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, requestIsHostAudioless],
            },
          } as DOMMessageEvent);

          // respond to the registerHandler
          const passedInIsMicMuted = false;
          framelessPlatformMock.respondToMessage({
            data: {
              func: 'meeting.micStateChanged',
              args: [{ isMicMuted: passedInIsMicMuted }],
            },
          } as DOMMessageEvent);
          await waitForEventQueue();

          const updateMicStateMessage = framelessPlatformMock.findMessageByFunc('meeting.updateMicState');
          expect(updateMicStateMessage).not.toBeNull();
          expect(updateMicStateMessage.args.length).toBe(2);
          expect(updateMicStateMessage.args[0]).toMatchObject({ isMicMuted: passedInIsMicMuted });
          expect(updateMicStateMessage.args[1]).toEqual(0 /* MicStateChangeReason.HostInitiated */);
        });

        it(`should call meeting.updateMicState with AppDeclinedToChange reason when mic state doesn't match. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const requestIsHostAudioless: boolean | null = true;

          const micStateCallbackDifferentValue = (micState: meeting.MicState) =>
            Promise.resolve({ isMicMuted: !micState.isMicMuted });

          // call and respond to requestAppAudioHandling
          meeting.requestAppAudioHandling(
            {
              isAppHandlingAudio: requestIsHostAudioless,
              micMuteStateChangedCallback: micStateCallbackDifferentValue,
            },
            (_result: boolean) => {},
          );
          const requestAppAudioHandlingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestAppAudioHandling',
          );
          expect(requestAppAudioHandlingMessage).not.toBeNull();

          const callbackId = requestAppAudioHandlingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, requestIsHostAudioless],
            },
          } as DOMMessageEvent);

          // respond to the registerHandler
          const passedInIsMicMuted = false;
          framelessPlatformMock.respondToMessage({
            data: {
              func: 'meeting.micStateChanged',
              args: [{ isMicMuted: passedInIsMicMuted }],
            },
          } as DOMMessageEvent);
          await waitForEventQueue();

          const updateMicStateMessage = framelessPlatformMock.findMessageByFunc('meeting.updateMicState');
          expect(updateMicStateMessage).not.toBeNull();
          expect(updateMicStateMessage.args.length).toBe(2);
          expect(updateMicStateMessage.args[0]).toMatchObject({ isMicMuted: !passedInIsMicMuted }); // expect different value than what was passed in
          expect(updateMicStateMessage.args[1]).toEqual(2 /* MicStateChangeReason.AppDeclinedToChange */);
        });

        it(`should call meeting.updateMicState with AppFailedToChange reason when mic callback throws. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const requestIsHostAudioless: boolean | null = true;

          const micStateCallbackThatThrowsError = (_micState: meeting.MicState) => {
            throw new Error('test error');
          };

          // call and respond to requestAppAudioHandling
          meeting.requestAppAudioHandling(
            {
              isAppHandlingAudio: requestIsHostAudioless,
              micMuteStateChangedCallback: micStateCallbackThatThrowsError,
            },
            (_result: boolean) => {},
          );
          const requestAppAudioHandlingMessage = framelessPlatformMock.findMessageByFunc(
            'meeting.requestAppAudioHandling',
          );
          expect(requestAppAudioHandlingMessage).not.toBeNull();

          const callbackId = requestAppAudioHandlingMessage.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, requestIsHostAudioless],
            },
          } as DOMMessageEvent);

          // respond to the registerHandler
          const passedInIsMicMuted = false;
          framelessPlatformMock.respondToMessage({
            data: {
              func: 'meeting.micStateChanged',
              args: [{ isMicMuted: passedInIsMicMuted }],
            },
          } as DOMMessageEvent);

          await waitForEventQueue();

          const updateMicStateMessage = framelessPlatformMock.findMessageByFunc('meeting.updateMicState');
          expect(updateMicStateMessage).not.toBeNull();
          expect(updateMicStateMessage.args[1]).toEqual(3 /* MicStateChangeReason.AppFailedToChange */);
        });
      } else {
        it(`should not allow meeting.requestAppAudioHandling calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() =>
            meeting.requestAppAudioHandling(
              { isAppHandlingAudio: true, micMuteStateChangedCallback: emptyMicStateCallback },
              emptyCallBack,
            ),
          ).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('updateMicState', () => {
    it('should not allow calls before initialization', () => {
      let micState: meeting.MicState = { isMicMuted: false };
      expect(() => meeting.updateMicState(micState)).toThrowError('The library has not yet been initialized');
    });
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should call meeting.updateMicState with micState from parameter and AppInitiated reason. context: ${context}`, async () => {
          await framelessPlatformMock.initializeWithContext(context);

          const micState: meeting.MicState = { isMicMuted: false };
          meeting.updateMicState(micState);

          const updateMicStateMessage = framelessPlatformMock.findMessageByFunc('meeting.updateMicState');
          expect(updateMicStateMessage).not.toBeNull();
          expect(updateMicStateMessage?.args[0]).toMatchObject(micState);
          expect(updateMicStateMessage?.args[1]).toEqual(1 /* MicStateChangeReason.AppInitiated */);
        });
      } else {
        it(`should not allow meeting.updateMicState calls from ${context} context`, async () => {
          await framelessPlatformMock.initializeWithContext(context);
          expect(() => meeting.updateMicState({ isMicMuted: false })).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
