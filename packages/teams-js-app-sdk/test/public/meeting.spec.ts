import { meeting } from '../../src/public/meeting';
import { ErrorCode } from '../../src/public/interfaces';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FramelessPostMocks } from '../framelessPostMocks';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public';
import { Utils } from '../utils';

describe('meeting', () => {
  const desktopPlatformMock = new FramelessPostMocks();
  const utils = new Utils();

  beforeEach(() => {
    desktopPlatformMock.messages = [];
    app._initialize(desktopPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('toggleIncomingClientAudio', () => {
    it('should not allow calls before initialization', () => {
      expect(meeting.toggleIncomingClientAudio()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully toggle the incoming client audio', async () => {
      await desktopPlatformMock.initializeWithContext('sidePanel');

      const promise = meeting.toggleIncomingClientAudio();

      const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      const callbackId = toggleIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        },
      } as DOMMessageEvent);
      await expect(promise).resolves.toBe(true);
    });

    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext('meetingStage');

      const promise = meeting.toggleIncomingClientAudio();

      const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      const callbackId = toggleIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });
  });
  describe('getIncomingClientAudioState', () => {
    it('should not allow calls before initialization', () => {
      expect(meeting.getIncomingClientAudioState()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the incoming client audio state', async () => {
      await desktopPlatformMock.initializeWithContext('sidePanel');

      const promise = meeting.getIncomingClientAudioState();

      const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
      expect(getIncomingClientAudioMessage).not.toBeNull();
      const callbackId = getIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        },
      } as DOMMessageEvent);
      await expect(promise).resolves.toBe(true);
    });

    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext('meetingStage');

      const promise = meeting.getIncomingClientAudioState();

      const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
      expect(getIncomingClientAudioMessage).not.toBeNull();
      const callbackId = getIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });
  });
  describe('getMeetingDetails', () => {
    it('should not allow calls before initialization', () => {
      expect(meeting.getMeetingDetails()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the meeting details', async () => {
      await desktopPlatformMock.initializeWithContext('content');

      const promise = meeting.getMeetingDetails();

      const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
      expect(getMeetingDetailsMessage).not.toBeNull();
      const callbackId = getMeetingDetailsMessage.id;
      const details: meeting.IDetails = {
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
      };
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, meetingDetails],
        },
      } as DOMMessageEvent);
      await expect(promise).resolves.toBe(meetingDetails);
    });

    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext('meetingStage');

      const promise = meeting.getMeetingDetails();

      const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
      expect(getMeetingDetailsMessage).not.toBeNull();
      const callbackId = getMeetingDetailsMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });
  });
  describe('getAuthenticationTokenForAnonymousUser', () => {
    it('should not allow calls before initialization', () => {
      expect(meeting.getAuthenticationTokenForAnonymousUser()).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successfully get the anonymous user token of the user in meeting', async () => {
      await desktopPlatformMock.initializeWithContext('meetingStage');

      const promise = meeting.getAuthenticationTokenForAnonymousUser();

      const getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAuthenticationTokenForAnonymousUser',
      );
      expect(getAnonymousUserTokenMessage).not.toBeNull();
      const callbackId = getAnonymousUserTokenMessage.id;
      const mockAuthenticationToken = '1234567890oiuytrdeswasdcfvbgnhjmuy6t54ewsxdcvbnu743edfvbnm,o98';
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, mockAuthenticationToken],
        },
      } as DOMMessageEvent);
      await expect(promise).resolves.toBe(mockAuthenticationToken);
    });
    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext('sidePanel');
      const promise = meeting.getAuthenticationTokenForAnonymousUser();

      const getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAuthenticationTokenForAnonymousUser',
      );
      expect(getAnonymousUserTokenMessage).not.toBeNull();
      const callbackId = getAnonymousUserTokenMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });
  });

  describe('getLiveStreamState', () => {
    it('should fail when called before app is initialized', () => {
      expect(meeting.getLiveStreamState()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.getLiveStreamState();

      const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
      expect(getLiveStreamStateMessage).not.toBeNull();

      const callbackId = getLiveStreamStateMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });

    it('should successfully get live stream state', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.getLiveStreamState();

      const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
      expect(getLiveStreamStateMessage).not.toBeNull();

      const callbackId = getLiveStreamStateMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, { isStreaming: true }],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves.toEqual({ isStreaming: true });
    });
  });

  describe('requestStartLiveStreaming', () => {
    it('should fail when called before app is initialized', () => {
      expect(meeting.requestStartLiveStreaming('streamurl', 'streamkey')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStartLiveStreaming('streamurl', 'streamkey');

      const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStartLiveStreaming');
      expect(requestStartLiveStreamMessage).not.toBeNull();

      const callbackId = requestStartLiveStreamMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });

    it('should successfully request start live streaming', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStartLiveStreaming('streamurl', 'streamkey');

      const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStartLiveStreaming');
      expect(requestStartLiveStreamMessage).not.toBeNull();

      const callbackId = requestStartLiveStreamMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, { isStreaming: true }],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves;
      expect(requestStartLiveStreamMessage.args).toEqual(['streamurl', 'streamkey']);
    });
  });

  describe('requestStopLiveStreaming', () => {
    it('should fail when called before app is initialized', () => {
      expect(meeting.requestStopLiveStreaming()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should return error code 500', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStopLiveStreaming();

      const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStopLiveStreaming');
      expect(requestStopLiveStreamingMessage).not.toBeNull();

      const callbackId = requestStopLiveStreamingMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });

    it('should successfully request start live streaming', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStopLiveStreaming();

      const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStopLiveStreaming');
      expect(requestStopLiveStreamingMessage).not.toBeNull();

      const callbackId = requestStopLiveStreamingMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, { isStreaming: false }],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves;
    });
  });

  describe('registerLiveStreamChangedHandler', () => {
    it('should fail when called without a handler', () => {
      expect(() => meeting.registerLiveStreamChangedHandler(null)).toThrowError(
        '[register live stream changed handler] Handler cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(() => meeting.registerLiveStreamChangedHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successfully register a handler for when live stream is changed', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);

      let handlerCalled = false;
      let returnedLiveStreamState: meeting.LiveStreamState | null;

      meeting.registerLiveStreamChangedHandler((liveStreamState: meeting.LiveStreamState) => {
        handlerCalled = true;
        returnedLiveStreamState = liveStreamState;
      });

      utils.sendMessage('meeting.liveStreamChanged', { isStreaming: true });

      expect(handlerCalled).toBe(true);
      expect(returnedLiveStreamState).not.toBeNull();
      expect(returnedLiveStreamState).toEqual({ isStreaming: true });
    });

    describe('shareAppContentToStage', () => {
      it('should not allow calls before initialization', () => {
        return expect(meeting.shareAppContentToStage('')).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      it('should successfully share app content to stage', () => {
        desktopPlatformMock.initializeWithContext('sidePanel');

        const requestUrl = 'validUrl';
        const promise = meeting.shareAppContentToStage(requestUrl);

        const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
        expect(shareAppContentToStageMessage).not.toBeNull();
        const callbackId = shareAppContentToStageMessage.id;

        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);

        expect(promise).resolves.toEqual(true);
        expect(shareAppContentToStageMessage.args).toContain(requestUrl);
      });

      it('should return error code 500', () => {
        desktopPlatformMock.initializeWithContext('sidePanel');

        const requestUrl = 'invalidAppUrl';
        const promise = meeting.shareAppContentToStage(requestUrl);

        const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
        expect(shareAppContentToStageMessage).not.toBeNull();
        const callbackId = shareAppContentToStageMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
        expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        expect(shareAppContentToStageMessage.args).toContain(requestUrl);
        expect;
      });
    });

    describe('getAppContentStageSharingCapabilities', () => {
      it('should not allow calls before initialization', () => {
        return expect(meeting.getAppContentStageSharingCapabilities).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      it('should return correct error information', () => {
        desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

        const promise = meeting.getAppContentStageSharingCapabilities();

        const appContentStageSharingCapabilitiesMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.getAppContentStageSharingCapabilities',
        );
        expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
        const callbackId = appContentStageSharingCapabilitiesMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);

        expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      });

      it('should successfully get info', () => {
        desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

        const promise = meeting.getAppContentStageSharingCapabilities();

        const appContentStageSharingCapabilities = {
          doesAppHaveSharePermission: true,
        };

        const appContentStageSharingCapabilitiesMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.getAppContentStageSharingCapabilities',
        );
        expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
        const callbackId = appContentStageSharingCapabilitiesMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, appContentStageSharingCapabilities],
          },
        } as DOMMessageEvent);

        expect(promise).resolves.toStrictEqual(appContentStageSharingCapabilities);
      });
    });

    describe('stopSharingAppContentToStage', () => {
      it('should not allow calls before initialization', () => {
        return expect(meeting.stopSharingAppContentToStage).rejects.toThrowError(
          'The library has not yet been initialized',
        );
      });

      it('should successfully terminate app content stage sharing session', () => {
        desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

        const promise = meeting.stopSharingAppContentToStage();

        const stopSharingAppContentToStageMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.stopSharingAppContentToStage',
        );
        expect(stopSharingAppContentToStageMessage).not.toBeNull();
        const callbackId = stopSharingAppContentToStageMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);
        expect(promise).resolves.toBe(true);
      });

      it('should return correct error information', () => {
        desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

        const promise = meeting.stopSharingAppContentToStage();

        const stopSharingAppContentToStageMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.stopSharingAppContentToStage',
        );
        expect(stopSharingAppContentToStageMessage).not.toBeNull();
        const callbackId = stopSharingAppContentToStageMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
        expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      });
    });
  });
});
