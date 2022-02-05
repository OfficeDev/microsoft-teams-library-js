import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { ErrorCode } from '../../src/public/interfaces';
import { meeting } from '../../src/public/meeting';
import { FramelessPostMocks } from '../framelessPostMocks';
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
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    it('should not allow calls before initialization', () => {
      expect(() => meeting.toggleIncomingClientAudio()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.toggleIncomingClientAudio calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.toggleIncomingClientAudio()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should successfully send the toggleIncomingClientAudio message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);
        meeting.toggleIncomingClientAudio();
        const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
        expect(toggleIncomingClientAudioMessage).not.toBeNull();
        expect(toggleIncomingClientAudioMessage.args.length).toEqual(0);
      });
      it(`should resolve promise after successfully sending the toggleIncomingClientAudio message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.toggleIncomingClientAudio();

        const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
        const callbackId = toggleIncomingClientAudioMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);
        await expect(promise).resolves.toBe(true);
      });

      it(`should throw if the toggleIncomingClientAudio message sends and fails context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.toggleIncomingClientAudio();

        const toggleIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('toggleIncomingClientAudio');
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
  });

  describe('getIncomingClientAudioState', () => {
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getIncomingClientAudioState()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.getIncomingClientAudioState calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.getIncomingClientAudioState()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should successfully send the getIncomingClientAudio message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);
        meeting.getIncomingClientAudioState();
        const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
        expect(getIncomingClientAudioMessage).not.toBeNull();
        expect(getIncomingClientAudioMessage.args.length).toEqual(0);
      });
      it(`should successully resolve the promise after successfully sending the meeting.getIncomingClientAudioState calls. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getIncomingClientAudioState();

        const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
        const callbackId = getIncomingClientAudioMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, true],
          },
        } as DOMMessageEvent);
        await expect(promise).resolves.toBe(true);
      });
      it(`should throw if the getIncomingClientAudioState message sends and fails ${context} context`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getIncomingClientAudioState();

        const getIncomingClientAudioMessage = desktopPlatformMock.findMessageByFunc('getIncomingClientAudioState');
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
  });

  describe('getMeetingDetails', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getMeetingDetails()).toThrowError('The library has not yet been initialized');
    });
    const allowedContexts = [
      FrameContexts.sidePanel,
      FrameContexts.meetingStage,
      FrameContexts.settings,
      FrameContexts.content,
    ];

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.getMeetingDetails calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.getMeetingDetails()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should successfully send the getMeetingDetailsMessage message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        meeting.getMeetingDetails();

        const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
        expect(getMeetingDetailsMessage).not.toBeNull();
        expect(getMeetingDetailsMessage.args.length).toEqual(0);
      });
      it(`should resolve the promise after succesfully sending the meeting.getMeetingDetails calls. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getMeetingDetails();

        const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
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
          id: 'convId',
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
      it(`should throw if the getMeetingDetails message sends and fails. context: ${context} `, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getMeetingDetails();

        const getMeetingDetailsMessage = desktopPlatformMock.findMessageByFunc('meeting.getMeetingDetails');
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
  });

  describe('getAuthenticationTokenForAnonymousUser', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getAuthenticationTokenForAnonymousUser()).toThrowError(
        'The library has not yet been initialized',
      );
    });
    const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.getAuthenticationTokenForAnonymousUser calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.getAuthenticationTokenForAnonymousUser()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should successfully send the getAuthenticationTokenForAnonymousUser message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        meeting.getAuthenticationTokenForAnonymousUser();

        const getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.getAuthenticationTokenForAnonymousUser',
        );
        expect(getAnonymousUserTokenMessage).not.toBeNull();
        expect(getAnonymousUserTokenMessage.args.length).toEqual(0);
      });
      it(`should resolve promise after successfully sending the getAuthenticationTokenForAnonymousUser message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getAuthenticationTokenForAnonymousUser();

        const getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.getAuthenticationTokenForAnonymousUser',
        );
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
      it(`should throw if the getAuthenticationTokenForAnonymousUser message sends and fails. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);
        const promise = meeting.getAuthenticationTokenForAnonymousUser();

        const getAnonymousUserTokenMessage = desktopPlatformMock.findMessageByFunc(
          'meeting.getAuthenticationTokenForAnonymousUser',
        );
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
  });

  describe('getLiveStreamState', () => {
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.getLiveStreamState()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it(`should successfully send the getLiveStreamState message. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        meeting.getLiveStreamState();

        const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
        expect(getLiveStreamStateMessage).not.toBeNull();
        expect(getLiveStreamStateMessage.args.length).toEqual(0);
      });

      it(`should resolve the promise after succesfully sending the meeting.getLiveStreamState call. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getLiveStreamState();

        const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');
        const callbackId = getLiveStreamStateMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, { isStreaming: true }],
          },
        } as DOMMessageEvent);

        await expect(promise).resolves.toEqual({ isStreaming: true });
      });
      it(`should throw if the getLiveStreamState message sends and fails. context: ${context}`, async () => {
        await desktopPlatformMock.initializeWithContext(context);

        const promise = meeting.getLiveStreamState();

        const getLiveStreamStateMessage = desktopPlatformMock.findMessageByFunc('meeting.getLiveStreamState');

        const callbackId = getLiveStreamStateMessage.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
          },
        } as DOMMessageEvent);

        await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      });
    });
  });

  describe('requestStartLiveStreaming', () => {
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.requestStartLiveStreaming('streamurl', 'streamkey')).toThrowError(
        'The library has not yet been initialized',
      );
    });
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.requestStartLiveStreaming calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.requestStartLiveStreaming('streamurl', 'streamkey')).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    it('should successfully send the requestStartLiveStreaming message.', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      meeting.requestStartLiveStreaming('streamurl', 'streamkey');

      const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStartLiveStreaming');
      expect(requestStartLiveStreamMessage).not.toBeNull();
      expect(requestStartLiveStreamMessage.args).toEqual(['streamurl', 'streamkey']);
    });

    it('should throw if the requestStartLiveStreaming message sends and fails', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStartLiveStreaming('streamurl', 'streamkey');

      const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStartLiveStreaming');

      const callbackId = requestStartLiveStreamMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });

    it('should resolve the promise after succesfully sending the meeting.requestStartLiveStreaming call', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStartLiveStreaming('streamurl', 'streamkey');

      const requestStartLiveStreamMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStartLiveStreaming');

      const callbackId = requestStartLiveStreamMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, undefined],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves.toBe(undefined);
    });
  });

  describe('requestStopLiveStreaming', () => {
    it('should fail when called before app is initialized', () => {
      expect(() => meeting.requestStopLiveStreaming()).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.requestStopLiveStreaming calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.requestStopLiveStreaming()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });
    it('should successfully send the requestStartLiveStreaming message.', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      meeting.requestStopLiveStreaming();

      const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStopLiveStreaming');
      expect(requestStopLiveStreamingMessage).not.toBeNull();
      expect(requestStopLiveStreamingMessage.args.length).toEqual(0);
    });

    it('should throw if the requestStopLiveStreaming message sends and fails', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStopLiveStreaming();

      const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStopLiveStreaming');

      const callbackId = requestStopLiveStreamingMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });

    it('should resolve the promise after succesfully sending the meeting.requestStopLiveStreaming call', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.requestStopLiveStreaming();

      const requestStopLiveStreamingMessage = desktopPlatformMock.findMessageByFunc('meeting.requestStopLiveStreaming');

      const callbackId = requestStopLiveStreamingMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, undefined],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves.toBe(undefined);
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
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.registerLiveStreamChangedHandler calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(() => meeting.registerLiveStreamChangedHandler(() => {})).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
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
  });

  describe('shareAppContentToStage', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meeting.shareAppContentToStage('')).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.shareAppContentToStage calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.shareAppContentToStage('')).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    it('should successfully send the shareAppContentToStage message.', async () => {
      desktopPlatformMock.initializeWithContext('sidePanel');

      const requestUrl = 'validUrl';
      meeting.shareAppContentToStage(requestUrl);

      const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
      expect(shareAppContentToStageMessage).not.toBeNull();
      expect(shareAppContentToStageMessage.args).toContain(requestUrl);
    });
    it('should resolve the promise after succesfully sending the meeting.shareAppContentToStage call', async () => {
      desktopPlatformMock.initializeWithContext('sidePanel');

      const requestUrl = 'validUrl';
      const promise = meeting.shareAppContentToStage(requestUrl);

      const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
      const callbackId = shareAppContentToStageMessage.id;

      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves.toEqual(true);
      expect(shareAppContentToStageMessage.args).toContain(requestUrl);
    });

    it('should throw if the shareAppContentToStage message sends and fails', async () => {
      desktopPlatformMock.initializeWithContext('sidePanel');

      const requestUrl = 'invalidAppUrl';
      const promise = meeting.shareAppContentToStage(requestUrl);

      const shareAppContentToStageMessage = desktopPlatformMock.findMessageByFunc('meeting.shareAppContentToStage');
      const callbackId = shareAppContentToStageMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      expect(shareAppContentToStageMessage.args).toContain(requestUrl);
    });
  });

  describe('getAppContentStageSharingCapabilities', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meeting.getAppContentStageSharingCapabilities()).toThrowError(
        'The library has not yet been initialized',
      );
    });
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.getAppContentStageSharingCapabilities calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.getAppContentStageSharingCapabilities()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });
    it('should successfully send the getAppContentStageSharingCapabilities message.', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      meeting.getAppContentStageSharingCapabilities();

      const appContentStageSharingCapabilitiesMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAppContentStageSharingCapabilities',
      );
      expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
      expect(appContentStageSharingCapabilitiesMessage.args.length).toEqual(0);
    });
    it('should return correct error information', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.getAppContentStageSharingCapabilities();

      const appContentStageSharingCapabilitiesMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAppContentStageSharingCapabilities',
      );
      const callbackId = appContentStageSharingCapabilitiesMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });

    it('should resolve the promise after succesfully sending the meeting.getAppContentStageSharingCapabilities call', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.getAppContentStageSharingCapabilities();

      const appContentStageSharingCapabilities = {
        doesAppHaveSharePermission: true,
      };

      const appContentStageSharingCapabilitiesMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAppContentStageSharingCapabilities',
      );
      const callbackId = appContentStageSharingCapabilitiesMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, appContentStageSharingCapabilities],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves.toStrictEqual(appContentStageSharingCapabilities);
    });
  });

  describe('stopSharingAppContentToStage', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meeting.stopSharingAppContentToStage()).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.stopSharingAppContentToStage calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.stopSharingAppContentToStage()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    it('should successfully send the stopSharingAppContentToStage message.', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      meeting.stopSharingAppContentToStage();

      const stopSharingAppContentToStageMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.stopSharingAppContentToStage',
      );
      expect(stopSharingAppContentToStageMessage).not.toBeNull();
      expect(stopSharingAppContentToStageMessage.args.length).toEqual(0);
    });
    it('should successfully resolve the promise after sending stopSharingAppContentToStage call', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.stopSharingAppContentToStage();

      const stopSharingAppContentToStageMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.stopSharingAppContentToStage',
      );
      const callbackId = stopSharingAppContentToStageMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        },
      } as DOMMessageEvent);
      await expect(promise).resolves.toBe(true);
    });

    it('should throw if the stopSharingAppContentToStage message sends and fails', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.stopSharingAppContentToStage();

      const stopSharingAppContentToStageMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.stopSharingAppContentToStage',
      );
      const callbackId = stopSharingAppContentToStageMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);
      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });
  });

  describe('getAppContentStageSharingState', () => {
    it('should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => meeting.getAppContentStageSharingState()).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it(`should not allow meeting.getAppContentStageSharingState calls from ${context} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(context);

        expect(() => meeting.getAppContentStageSharingState()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });
    it('should successfully send the getAppContentStageSharingState message.', async () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      meeting.getAppContentStageSharingState();

      const appContentStageSharingStateMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAppContentStageSharingState',
      );
      expect(appContentStageSharingStateMessage).not.toBeNull();
      expect(appContentStageSharingStateMessage.args.length).toEqual(0);
    });
    it('should successfully get current stage sharing state information and resolves the promise', async () => {
      expect.assertions(4); // 1 assertions from this unit test, and 3 assertions from desktopPlatformMock.initializeWithContext
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.getAppContentStageSharingState();

      const appContentStageSharingState = {
        isAppSharing: true,
      };

      const appContentStageSharingStateMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAppContentStageSharingState',
      );
      const callbackId = appContentStageSharingStateMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, appContentStageSharingState],
        },
      } as DOMMessageEvent);

      await expect(promise).resolves.toStrictEqual(appContentStageSharingState);
    });

    it('should throw if the getAppContentStageSharingState message sends and fails', async () => {
      expect.assertions(4); // 1 assertions from this unit test, and 3 assertions from desktopPlatformMock.initializeWithContext
      desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      const promise = meeting.getAppContentStageSharingState();

      const appContentStageSharingStateMessage = desktopPlatformMock.findMessageByFunc(
        'meeting.getAppContentStageSharingState',
      );
      const callbackId = appContentStageSharingStateMessage.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
        },
      } as DOMMessageEvent);

      await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
    });
  });
});
