/* eslint-disable  @typescript-eslint/no-empty-function */
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { meeting } from '../../src/public/meeting';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('meeting_V1', () => {
  const desktopPlatformMock = new FramelessPostMocks();
  const utils = new Utils();

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
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.toggleIncomingClientAudio(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully toggle the incoming client audio', done => {
      desktopPlatformMock.initializeWithContext('sidePanel').then(() => {
        meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
          expect(error).toBeNull();
          expect(result).toBe(true);
          done();
        });
        const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
        expect(toggleIncomingClientAudioMessage).not.toBeNull();
        const callbackId = toggleIncomingClientAudioMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);
      });
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext('meetingStage');

      meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
        expect(error).not.toBeNull();
        expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        expect(result).toBeNull();
        done();
      });

      const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
      expect(toggleIncomingClientAudioMessage).not.toBeNull();
      const callbackId = toggleIncomingClientAudioMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
    });
  });

  describe('getIncomingClientAudioState', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getIncomingClientAudioState(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the incoming client audio state', done => {
      desktopPlatformMock.initializeWithContext('sidePanel').then(() => {
        meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
          expect(error).toBeNull();
          expect(result).toBe(true);
          done();
        });

        const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
        expect(getIncomingClientAudioMessage).not.toBeNull();
        const callbackId = getIncomingClientAudioMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);
      });
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext('meetingStage').then(() => {
        meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(result).toBeNull();
          done();
        });

        const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
        expect(getIncomingClientAudioMessage).not.toBeNull();
        const callbackId = getIncomingClientAudioMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
      });
    });
  });

  describe('getMeetingDetails', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getMeetingDetails(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the meeting details', done => {
      desktopPlatformMock.initializeWithContext('content').then(() => {
        meeting.getMeetingDetails((error: SdkError, meetingDetailsResponse: meeting.IMeetingDetailsResponse) => {
          expect(error).toBeNull();
          expect(meetingDetailsResponse).toStrictEqual(meetingDetailsResponse);
          done();
        });

        const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
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
        const meetingDetailsResponse: meeting.IMeetingDetailsResponse = {
          details,
          conversation,
          organizer,
        };
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, meetingDetailsResponse],
          },
        } as DOMMessageEvent);
      });
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext('meetingStage').then(() => {
        meeting.getMeetingDetails((error: SdkError, meetingDetailsResponse: meeting.IMeetingDetailsResponse) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(meetingDetailsResponse).toBe(null);
          done();
        });

        const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
        expect(getMeetingDetailsMessage).not.toBeNull();
        const callbackId = getMeetingDetailsMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
      });
    });
  });

  describe('getAuthenticationTokenForAnonymousUser', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getAuthenticationTokenForAnonymousUser(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get the anonymous user token of the user in meeting', done => {
      desktopPlatformMock.initializeWithContext('meetingStage').then(() => {
        meeting.getAuthenticationTokenForAnonymousUser(
          (error: SdkError, authenticationTokenOfAnonymousUser: string) => {
            expect(error).toBeNull();
            expect(authenticationTokenOfAnonymousUser).toBe(mockAuthenticationToken);
            done();
          },
        );

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
      });
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext('sidePanel').then(() => {
        meeting.getAuthenticationTokenForAnonymousUser(
          (error: SdkError, authenticationTokenOfAnonymousUser: string) => {
            expect(error).not.toBeNull();
            expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
            expect(authenticationTokenOfAnonymousUser).toBe(null);
            done();
          },
        );

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
      });
    });
  });

  describe('getLiveStreamState', () => {
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.getLiveStreamState(() => {})).toThrowError('The library has not yet been initialized');
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.getLiveStreamState((error: SdkError, liveStreamState: meeting.LiveStreamState) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(liveStreamState).toBe(null);
          done();
        });

        const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
        expect(getLiveStreamStateMessage).not.toBeNull();

        const callbackId = getLiveStreamStateMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
      });
    });

    it('should successfully get live stream state', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.getLiveStreamState((error: SdkError, liveStreamState: meeting.LiveStreamState) => {
          expect(error).toBe(null);
          expect(liveStreamState).not.toBeNull();
          expect(liveStreamState).toEqual({ isStreaming: true });
          done();
        });

        const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
        expect(getLiveStreamStateMessage).not.toBeNull();

        const callbackId = getLiveStreamStateMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, { isStreaming: true }],
          },
        } as DOMMessageEvent);
      });
    });
  });

  describe('requestStartLiveStreaming', () => {
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.requestStartLiveStreaming(() => {}, 'streamurl', 'streamkey')).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.requestStartLiveStreaming(
          (error: SdkError) => {
            expect(error).not.toBeNull();
            expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
            done();
          },
          'streamurl',
          'streamkey',
        );

        const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.requestStartLiveStreaming',
        );
        expect(requestStartLiveStreamMessage).not.toBeNull();

        const callbackId = requestStartLiveStreamMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
      });
    });

    it('should successfully request start live streaming', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.requestStartLiveStreaming(
          (error: SdkError) => {
            expect(error).toBe(null);
            done();
          },
          'streamurl',
          'streamkey',
        );

        const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.requestStartLiveStreaming',
        );
        expect(requestStartLiveStreamMessage).not.toBeNull();

        const callbackId = requestStartLiveStreamMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, { isStreaming: true }],
          },
        } as DOMMessageEvent);
        expect(requestStartLiveStreamMessage.args).toEqual(['streamurl', 'streamkey']);
      });
    });
  });

  describe('requestStopLiveStreaming', () => {
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.requestStopLiveStreaming(() => {})).toThrowError('The library has not yet been initialized');
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.requestStopLiveStreaming((error: SdkError) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          done();
        });

        const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.requestStopLiveStreaming',
        );
        expect(requestStopLiveStreamingMessage).not.toBeNull();

        const callbackId = requestStopLiveStreamingMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
      });
    });

    it('should successfully request start live streaming', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.requestStopLiveStreaming((error: SdkError) => {
          expect(error).toBe(null);
          done();
        });

        const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.requestStopLiveStreaming',
        );
        expect(requestStopLiveStreamingMessage).not.toBeNull();

        const callbackId = requestStopLiveStreamingMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, { isStreaming: false }],
          },
        } as DOMMessageEvent);
      });
    });
  });

  describe('registerLiveStreamChangedHandler', () => {
    it('should fail when called without a handler', () => {
      expect(() => meeting.registerLiveStreamChangedHandler(null)).toThrowError(
        '[register live stream changed handler] Handler cannot be null',
      );
    });

    it('should fail when called before app is initialized', () => {
      expect(() => meeting.registerLiveStreamChangedHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successfully register a handler for when live stream is changed', done => {
      utils.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.registerLiveStreamChangedHandler((liveStreamState: meeting.LiveStreamState) => {
          expect(liveStreamState).not.toBeNull();
          expect(liveStreamState).toEqual({ isStreaming: true });
          done();
        });

        utils.sendMessage('meeting.liveStreamChanged', { isStreaming: true });
      });
    });
  });

  describe('shareAppContentToStage', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.shareAppContentToStage(() => {
          return;
        }, ''),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully share app content to stage', done => {
      desktopPlatformMock.initializeWithContext('sidePanel').then(() => {
        const requestUrl = 'validUrl';
        meeting.shareAppContentToStage((error: SdkError, result: boolean) => {
          expect(error).toBeNull();
          expect(result).toBe(true);
          done();
        }, requestUrl);

        const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
        expect(shareAppContentToStageMessage).not.toBeNull();
        const callbackId = shareAppContentToStageMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);
        expect(shareAppContentToStageMessage.args).toContain(requestUrl);
      });
    });

    it('should return error code 500', done => {
      desktopPlatformMock.initializeWithContext('sidePanel').then(() => {
        const requestUrl = 'invalidAppUrl';
        meeting.shareAppContentToStage((error: SdkError, result: boolean) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(result).toBe(null);
          done();
        }, requestUrl);

        const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
        expect(shareAppContentToStageMessage).not.toBeNull();
        const callbackId = shareAppContentToStageMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);
        expect(shareAppContentToStageMessage.args).toContain(requestUrl);
      });
    });
  });

  describe('getAppContentStageSharingCapabilities', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getAppContentStageSharingCapabilities(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should return correct error information', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.getAppContentStageSharingCapabilities(
          (error: SdkError, appContentStageSharingCapabilities: meeting.IAppContentStageSharingCapabilities) => {
            expect(error).not.toBeNull();
            expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
            expect(appContentStageSharingCapabilities).toBe(null);
            done();
          },
        );

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
      });
    });

    it('should successfully get info', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.getAppContentStageSharingCapabilities(
          (error: SdkError, result: meeting.IAppContentStageSharingCapabilities) => {
            expect(error).toBeNull();
            expect(result).toStrictEqual(appContentStageSharingCapabilities);
            done();
          },
        );

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
      });
    });
  });

  describe('stopSharingAppContentToStage', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.stopSharingAppContentToStage(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully terminate app content stage sharing session', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.stopSharingAppContentToStage((error: SdkError, result: boolean) => {
          expect(error).toBeNull();
          expect(result).toBe(true);
          done();
        });

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
      });
    });

    it('should return correct error information', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.stopSharingAppContentToStage((error: SdkError, result: boolean) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          expect(result).toBe(null);
          done();
        });

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
      });
    });
  });

  describe('getAppContentStageSharingState', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getAppContentStageSharingState(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get current stage sharing state information', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel).then(() => {
        meeting.getAppContentStageSharingState((error: SdkError, result: meeting.IAppContentStageSharingState) => {
          expect(error).toBeNull();
          expect(result).toStrictEqual(appContentStageSharingState);
          done();
        });

        const appContentStageSharingState = {
          isAppSharing: true,
        };

        const appContentStageSharingStateMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.getAppContentStageSharingState',
        );
        expect(appContentStageSharingStateMessage).not.toBeNull();
        const callbackId = appContentStageSharingStateMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, appContentStageSharingState],
          },
        } as DOMMessageEvent);
      });
    });
  });
});
