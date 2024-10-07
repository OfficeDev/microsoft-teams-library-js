import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { MessageRequest } from '../../src/internal/messageObjects';
import { EmailAddress, FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { meeting } from '../../src/public/meeting';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('meeting', () => {
  const emptyCallBack = (): void => {
    return;
  };
  describe('framed', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
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
          await utils.initializeWithContext(context);

          let handlerCalled = false;
          let returnedLiveStreamState: meeting.LiveStreamState | null;

          meeting.registerLiveStreamChangedHandler((liveStreamState: meeting.LiveStreamState) => {
            handlerCalled = true;
            returnedLiveStreamState = liveStreamState;
          });

          await utils.sendMessage('meeting.liveStreamChanged', { isStreaming: true });

          expect(handlerCalled).toBe(true);
          expect(returnedLiveStreamState).not.toBeNull();
          expect(returnedLiveStreamState).toEqual({ isStreaming: true });
        });
      } else {
        it(`should not allow meeting.registerLiveStreamChangedHandler calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => meeting.registerLiveStreamChangedHandler(() => {})).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    describe('joinMeeting', () => {
      const dataError = 'Something went wrong...';

      const mockjoinMeetingParams: meeting.JoinMeetingParams = {
        joinWebUrl: new URL('https://example.com'),
        source: meeting.EventActionSource.Other,
      };

      it(`FRAMED: should successfully send the joinMeeting message`, async () => {
        await utils.initializeWithContext(FrameContexts.content);
        meeting.joinMeeting({
          ...mockjoinMeetingParams,
          source: meeting.EventActionSource.M365CalendarFormJoinTeamsMeetingButton,
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        if (joinMeetingMessage) {
          await utils.respondToMessage(joinMeetingMessage);
          expect(joinMeetingMessage?.args?.at(0)).toEqual({
            joinWebUrl: 'https://example.com/',
            source: meeting.EventActionSource.M365CalendarFormJoinTeamsMeetingButton,
          });
        }
      });

      it('FRAMED: should resolve if source is not provided', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        meeting.joinMeeting({
          joinWebUrl: new URL('https://example.com/'),
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        if (joinMeetingMessage) {
          await utils.respondToMessage(joinMeetingMessage);
          expect(joinMeetingMessage?.args?.at(0)).toEqual({
            joinWebUrl: 'https://example.com/',
            source: meeting.EventActionSource.Other,
          });
        }
      });

      it('FRAMED: should resolve if joinWebUrl is correct URL in string format', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        meeting.joinMeeting({
          joinWebUrl: new URL('https://example.com/'),
          source: meeting.EventActionSource.M365CalendarFormRibbonJoinButton,
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        if (joinMeetingMessage) {
          await utils.respondToMessage(joinMeetingMessage);

          expect(joinMeetingMessage?.args?.length).toEqual(1);
          expect(joinMeetingMessage?.args?.at(0)).toEqual({
            joinWebUrl: 'https://example.com/',
            source: meeting.EventActionSource.M365CalendarFormRibbonJoinButton,
          });
        }
      });
    });

    describe('requestAppAudioHandling', () => {
      const emptyMicStateCallback = (micState: meeting.MicState) => Promise.resolve(micState);
      const waitForEventQueue = () => new Promise((resolve) => setTimeout(resolve, 0));

      const allowedContexts = [FrameContexts.sidePanel, FrameContexts.meetingStage];
      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`should call meeting.audioDeviceSelectionChanged after meeting.requestAppAudioHandling. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            const requestIsHostAudioless: boolean | null = true;

            let callbackPayload: meeting.AudioDeviceSelection | undefined = undefined;
            const testCallback = (payload: meeting.AudioDeviceSelection) => {
              callbackPayload = payload;
              return Promise.resolve();
            };

            // call and respond to requestAppAudioHandling
            meeting.requestAppAudioHandling(
              {
                isAppHandlingAudio: requestIsHostAudioless,
                micMuteStateChangedCallback: (micState: meeting.MicState) => Promise.resolve(micState),
                audioDeviceSelectionChangedCallback: testCallback,
              },
              (_result: boolean) => {},
            );
            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            await utils.respondToMessage(requestAppAudioHandlingMessage, null, requestIsHostAudioless);

            // check that the registerHandler for audio device selection was called
            const registerHandlerMessage = utils.findMessageByFunc('registerHandler', 1);
            expect(registerHandlerMessage).not.toBeNull();
            expect(registerHandlerMessage.args.length).toBe(1);
            expect(registerHandlerMessage.args[0]).toBe('meeting.audioDeviceSelectionChanged');
          });
        } else {
          it(`should not allow meeting.requestAppAudioHandling calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

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

    describe('getMeetingDetails', () => {
      const allowedContexts = [
        FrameContexts.sidePanel,
        FrameContexts.meetingStage,
        FrameContexts.settings,
        FrameContexts.content,
      ];

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`FRAMED: should successfully get the meeting details. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            meeting.getMeetingDetails(
              (error: SdkError | null, meetingDetails: meeting.IMeetingDetailsResponse | null) => {
                return Promise.resolve();
              },
            );

            const getMeetingDetailsMessage = utils.findMessageByFunc('meeting.getMeetingDetails');
            expect(getMeetingDetailsMessage).not.toBeNull();

            if (getMeetingDetailsMessage) {
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

              await utils.respondToMessage(getMeetingDetailsMessage, null, meetingDetails);
              expect(getMeetingDetailsMessage.args?.length).toBe(0);
            }
          });
        } else {
          it(`FRAMED: should not allow meeting.getMeetingDetails calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            expect(() => meeting.getMeetingDetails(emptyCallBack)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('getMeetingDetailsVerbose', () => {
      const allowedContexts = [
        FrameContexts.sidePanel,
        FrameContexts.meetingStage,
        FrameContexts.settings,
        FrameContexts.content,
      ];

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`FRAMED: should successfully get the verbose meeting details. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            meeting.getMeetingDetailsVerbose();

            const message = utils.findMessageByFunc('meeting.getMeetingDetails');
            expect(message).not.toBeNull();

            if (message) {
              const details: meeting.IMeetingDetails | meeting.ICallDetails = {
                scheduledStartTime: '2020-12-21T21:30:00+00:00',
                joinUrl:
                  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_qwertyuiop[phgfdsasdfghjkjbvcxcvbnmyt1234567890!@#$%^&*(%40thread.v2/0?context=%7b%22Tid%22%3a%2272f988bf-86f1-41af-91ab-2d7cd011db47%22%2c%22Oid%22%3a%226b33ac33-85ae-4995-be29-1d38a77aa8e3%22%7d',
                type: meeting.CallType.OneOnOneCall,
                // Verbose details
                originalCallerInfo: {
                  phoneNumber: '1234567890',
                  email: new EmailAddress('calleremail@somedomain.com'),
                },
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

              await utils.respondToMessage(message, null, meetingDetails);

              const shouldGetVerboseDetails = true;
              expect(message.args?.length).toBe(1);
              expect(message.args?.[0]).toBe(shouldGetVerboseDetails);
            }
          });
        } else {
          it(`FRAMED: should not allow meeting.getMeetingDetailsVerbose calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            expect(() => meeting.getMeetingDetailsVerbose()).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
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
            await utils.initializeWithContext(context);
            meeting.toggleIncomingClientAudio(emptyCallBack);
            const toggleIncomingClientAudioMessage = utils.findMessageByFunc('toggleIncomingClientAudio');
            expect(toggleIncomingClientAudioMessage).not.toBeNull();
            expect(toggleIncomingClientAudioMessage.args.length).toEqual(0);
          });

          it(`should successfully toggle the incoming client audio context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            });

            const toggleIncomingClientAudioMessage = utils.findMessageByFunc('toggleIncomingClientAudio');
            expect(toggleIncomingClientAudioMessage).not.toBeNull();
            const callbackId = toggleIncomingClientAudioMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            meeting.toggleIncomingClientAudio((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            });

            const toggleIncomingClientAudioMessage = utils.findMessageByFunc('toggleIncomingClientAudio');
            expect(toggleIncomingClientAudioMessage).not.toBeNull();
            const callbackId = toggleIncomingClientAudioMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);
            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            });

            const getIncomingClientAudioMessage = utils.findMessageByFunc('getIncomingClientAudioState');
            expect(getIncomingClientAudioMessage).not.toBeNull();
            const callbackId = getIncomingClientAudioMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            meeting.getIncomingClientAudioState((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            });

            const getIncomingClientAudioMessage = utils.findMessageByFunc('getIncomingClientAudioState');
            expect(getIncomingClientAudioMessage).not.toBeNull();
            const callbackId = getIncomingClientAudioMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
          it(`FRAMELESS: should successfully get the meeting details. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedMeetingResult: meeting.IMeetingDetailsResponse | null;
            meeting.getMeetingDetails((error: SdkError, meetingDetails: meeting.IMeetingDetailsResponse) => {
              callbackCalled = true;
              returnedMeetingResult = meetingDetails;
              returnedSdkError = error;
            });

            const getMeetingDetailsMessage = utils.findMessageByFunc('meeting.getMeetingDetails');
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
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, meetingDetails],
              },
            } as DOMMessageEvent);
            expect(callbackCalled).toBe(true);
            expect(returnedSdkError).toBeNull();
            expect(returnedMeetingResult).toStrictEqual(meetingDetails);
          });

          it(`FRAMELESS: should throw if the getMeetingDetails message sends and fails. context: ${context} `, async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedMeetingDetails: meeting.IMeetingDetailsResponse | null;
            meeting.getMeetingDetails((error: SdkError, meetingDetails: meeting.IMeetingDetailsResponse) => {
              callbackCalled = true;
              returnedMeetingDetails = meetingDetails;
              returnedSdkError = error;
            });

            const getMeetingDetailsMessage = utils.findMessageByFunc('meeting.getMeetingDetails');
            expect(getMeetingDetailsMessage).not.toBeNull();
            const callbackId = getMeetingDetailsMessage.id;
            await utils.respondToFramelessMessage({
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
          it(`FRAMELESS: should not allow meeting.getMeetingDetails calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            expect(() => meeting.getMeetingDetails(emptyCallBack)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('getMeetingDetailsVerbose', () => {
      const allowedContexts = [
        FrameContexts.sidePanel,
        FrameContexts.meetingStage,
        FrameContexts.settings,
        FrameContexts.content,
      ];

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`FRAMELESS: should successfully get the verbose meeting details. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            const promise = meeting.getMeetingDetailsVerbose();

            const message = utils.findMessageByFunc('meeting.getMeetingDetails');
            expect(message).not.toBeNull();
            expect(message?.args?.length).toBe(1);

            const shouldGetVerboseDetails = true;
            expect(message?.args?.[0]).toEqual(shouldGetVerboseDetails);

            const callbackId = message?.id;
            const details: meeting.IMeetingDetails | meeting.ICallDetails = {
              scheduledStartTime: '2020-12-21T21:30:00+00:00',
              joinUrl:
                'https://teams.microsoft.com/l/meetup-join/19%3ameeting_qwertyuiop[phgfdsasdfghjkjbvcxcvbnmyt1234567890!@#$%^&*(%40thread.v2/0?context=%7b%22Tid%22%3a%2272f988bf-86f1-41af-91ab-2d7cd011db47%22%2c%22Oid%22%3a%226b33ac33-85ae-4995-be29-1d38a77aa8e3%22%7d',
              type: meeting.CallType.OneOnOneCall,
              // Verbose details
              originalCallerInfo: {
                phoneNumber: '1234567890',
                email: new EmailAddress('calleeemail@somedomain.com'),
              },
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
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, meetingDetails],
              },
            } as DOMMessageEvent);

            await expect(promise).resolves.toBe(meetingDetails);
          });

          it(`FRAMELESS: should throw if the getMeetingDetailsVerbose message sends and fails. context: ${context} `, async () => {
            await utils.initializeWithContext(context);

            const promise = meeting.getMeetingDetailsVerbose();

            const message = utils.findMessageByFunc('meeting.getMeetingDetails');
            expect(message).not.toBeNull();
            expect(message?.args?.length).toBe(1);

            const shouldGetVerboseDetails = true;
            expect(message?.args?.[0]).toEqual(shouldGetVerboseDetails);

            const callbackId = message?.id;

            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [{ errorCode: ErrorCode.INTERNAL_ERROR }, null],
              },
            } as DOMMessageEvent);

            await expect(promise).rejects.toEqual(new Error(ErrorCode.INTERNAL_ERROR.toString()));
          });

          it(`FRAMELESS: should throw if host doesn't return verbose details. context: ${context} `, async () => {
            await utils.initializeWithContext(context);

            try {
              const promise = meeting.getMeetingDetailsVerbose();

              const message = utils.findMessageByFunc('meeting.getMeetingDetails');
              expect(message).not.toBeNull();
              expect(message?.args?.length).toBe(1);

              const shouldGetVerboseDetails = true;
              expect(message?.args?.[0]).toEqual(shouldGetVerboseDetails);

              const callbackId = message?.id;
              const nonVerboseDetails: meeting.IMeetingDetails | meeting.ICallDetails = {
                scheduledStartTime: '2020-12-21T21:30:00+00:00',
                joinUrl:
                  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_qwertyuiop[phgfdsasdfghjkjbvcxcvbnmyt1234567890!@#$%^&*(%40thread.v2/0?context=%7b%22Tid%22%3a%2272f988bf-86f1-41af-91ab-2d7cd011db47%22%2c%22Oid%22%3a%226b33ac33-85ae-4995-be29-1d38a77aa8e3%22%7d',
                type: meeting.CallType.OneOnOneCall,
              };
              const organizer: meeting.IOrganizer = {
                id: '8:orgid:6b33ac33-85ae-4995-be29-1d38a77aa8e3',
                tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
              };
              const conversation: meeting.IConversation = {
                id: 'convId',
              };
              const meetingDetails: meeting.IMeetingDetailsResponse = {
                details: nonVerboseDetails,
                conversation,
                organizer,
              };
              await utils.respondToFramelessMessage({
                data: {
                  id: callbackId,
                  args: [null, meetingDetails],
                },
              } as DOMMessageEvent);

              await promise;
            } catch (e) {
              expect(e).toEqual(new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString()));
            }
          });
        } else {
          it(`FRAMELESS: should not allow meeting.getMeetingDetailsVerbose calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

            expect(() => meeting.getMeetingDetailsVerbose()).rejects.toThrowError(
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
            await utils.initializeWithContext(context);
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

            const getAnonymousUserTokenMessage = utils.findMessageByFunc(
              'meeting.getAuthenticationTokenForAnonymousUser',
            );
            expect(getAnonymousUserTokenMessage).not.toBeNull();
            const callbackId = getAnonymousUserTokenMessage.id;
            const mockAuthenticationToken = '1234567890oiuytrdeswasdcfvbgnhjmuy6t54ewsxdcvbnu743edfvbnm,o98';
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);
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

            const getAnonymousUserTokenMessage = utils.findMessageByFunc(
              'meeting.getAuthenticationTokenForAnonymousUser',
            );
            expect(getAnonymousUserTokenMessage).not.toBeNull();
            const callbackId = getAnonymousUserTokenMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedLiveStreamState: meeting.LiveStreamState | null;

            meeting.getLiveStreamState((error: SdkError, liveStreamState: meeting.LiveStreamState) => {
              callbackCalled = true;
              returnedSdkError = error;
              returnedLiveStreamState = liveStreamState;
            });

            const getLiveStreamStateMessage = utils.findMessageByFunc('meeting.getLiveStreamState');
            expect(getLiveStreamStateMessage).not.toBeNull();

            const callbackId = getLiveStreamStateMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedLiveStreamState: meeting.LiveStreamState | null;

            meeting.getLiveStreamState((error: SdkError, liveStreamState: meeting.LiveStreamState) => {
              callbackCalled = true;
              returnedSdkError = error;
              returnedLiveStreamState = liveStreamState;
            });

            const getLiveStreamStateMessage = utils.findMessageByFunc('meeting.getLiveStreamState');
            expect(getLiveStreamStateMessage).not.toBeNull();

            const callbackId = getLiveStreamStateMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);

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

            const requestStartLiveStreamMessage = utils.findMessageByFunc('meeting.requestStartLiveStreaming');
            expect(requestStartLiveStreamMessage).not.toBeNull();

            const callbackId = requestStartLiveStreamMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);
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

            const requestStartLiveStreamMessage = utils.findMessageByFunc('meeting.requestStartLiveStreaming');
            expect(requestStartLiveStreamMessage).not.toBeNull();

            const callbackId = requestStartLiveStreamMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
        expect(() => meeting.requestStopLiveStreaming(emptyCallBack)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should throw if the requestStopLiveStreaming message sends and fails', async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;

            meeting.requestStopLiveStreaming((error: SdkError) => {
              callbackCalled = true;
              returnedSdkError = error;
            });

            const requestStopLiveStreamingMessage = utils.findMessageByFunc('meeting.requestStopLiveStreaming');
            expect(requestStopLiveStreamingMessage).not.toBeNull();

            const callbackId = requestStopLiveStreamingMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);
            let callbackCalled = false;
            let returnedSdkError: SdkError | null;

            meeting.requestStopLiveStreaming((error: SdkError) => {
              callbackCalled = true;
              returnedSdkError = error;
            });

            const requestStopLiveStreamingMessage = utils.findMessageByFunc('meeting.requestStopLiveStreaming');
            expect(requestStopLiveStreamingMessage).not.toBeNull();

            const callbackId = requestStopLiveStreamingMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
          it(`should successfully share app content to stage with default shareOptions. content: ${context} context`, async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            const requestUrl = 'validUrl';
            const shareOptions = {
              sharingProtocol: meeting.SharingProtocol.Collaborative,
            };
            meeting.shareAppContentToStage((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            }, requestUrl);

            const shareAppContentToStageMessage = utils.findMessageByFunc('meeting.shareAppContentToStage');
            expect(shareAppContentToStageMessage).not.toBeNull();
            const callbackId = shareAppContentToStageMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, true],
              },
            } as DOMMessageEvent);
            expect(callbackCalled).toBe(true);
            expect(returnedSdkError).toBeNull();
            expect(returnedResult).toBe(true);
            expect(shareAppContentToStageMessage.args).toContain(requestUrl);
            expect(shareAppContentToStageMessage.args[1]).toMatchObject(shareOptions);
          });
          it(`should successfully share app content to stage. content: ${context} context`, async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            const requestUrl = 'validUrl';
            const shareOptions = {
              sharingProtocol: meeting.SharingProtocol.ScreenShare,
            };
            meeting.shareAppContentToStage(
              (error: SdkError, result: boolean) => {
                callbackCalled = true;
                returnedResult = result;
                returnedSdkError = error;
              },
              requestUrl,
              shareOptions,
            );

            const shareAppContentToStageMessage = utils.findMessageByFunc('meeting.shareAppContentToStage');
            expect(shareAppContentToStageMessage).not.toBeNull();
            const callbackId = shareAppContentToStageMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, true],
              },
            } as DOMMessageEvent);
            expect(callbackCalled).toBe(true);
            expect(returnedSdkError).toBeNull();
            expect(returnedResult).toBe(true);
            expect(shareAppContentToStageMessage.args).toContain(requestUrl);
            expect(shareAppContentToStageMessage.args[1]).toMatchObject(shareOptions);
          });

          it('should throw if the shareAppContentToStage message sends and fails', async () => {
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            const requestUrl = 'invalidAppUrl';
            meeting.shareAppContentToStage((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            }, requestUrl);

            const shareAppContentToStageMessage = utils.findMessageByFunc('meeting.shareAppContentToStage');
            expect(shareAppContentToStageMessage).not.toBeNull();
            const callbackId = shareAppContentToStageMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);
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

            const appContentStageSharingCapabilitiesMessage = utils.findMessageByFunc(
              'meeting.getAppContentStageSharingCapabilities',
            );
            expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
            const callbackId = appContentStageSharingCapabilitiesMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);
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

            const appContentStageSharingCapabilitiesMessage = utils.findMessageByFunc(
              'meeting.getAppContentStageSharingCapabilities',
            );
            expect(appContentStageSharingCapabilitiesMessage).not.toBeNull();
            const callbackId = appContentStageSharingCapabilitiesMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            meeting.stopSharingAppContentToStage((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            });

            const stopSharingAppContentToStageMessage = utils.findMessageByFunc('meeting.stopSharingAppContentToStage');
            expect(stopSharingAppContentToStageMessage).not.toBeNull();
            const callbackId = stopSharingAppContentToStageMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

            let callbackCalled = false;
            let returnedSdkError: SdkError | null;
            let returnedResult: boolean | null;
            meeting.stopSharingAppContentToStage((error: SdkError, result: boolean) => {
              callbackCalled = true;
              returnedResult = result;
              returnedSdkError = error;
            });

            const stopSharingAppContentToStageMessage = utils.findMessageByFunc('meeting.stopSharingAppContentToStage');
            expect(stopSharingAppContentToStageMessage).not.toBeNull();
            const callbackId = stopSharingAppContentToStageMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);

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

            const appContentStageSharingStateMessage = utils.findMessageByFunc(
              'meeting.getAppContentStageSharingState',
            );
            expect(appContentStageSharingStateMessage).not.toBeNull();
            const callbackId = appContentStageSharingStateMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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

            const appContentStageSharingStateMessage = utils.findMessageByFunc(
              'meeting.getAppContentStageSharingState',
            );
            expect(appContentStageSharingStateMessage).not.toBeNull();
            const callbackId = appContentStageSharingStateMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const speakingState: meeting.ISpeakingState = { isSpeakingDetected: true };

        let handlerCalled = false;
        let returnedSpeakingState: meeting.ISpeakingState | null;

        meeting.registerSpeakingStateChangeHandler((speakingState: meeting.ISpeakingState) => {
          handlerCalled = true;
          returnedSpeakingState = speakingState;
        });

        const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
        expect(registerHandlerMessage).not.toBeNull();
        expect(registerHandlerMessage.args.length).toBe(1);
        expect(registerHandlerMessage.args[0]).toBe('meeting.speakingStateChanged');

        await utils.respondToFramelessMessage({
          data: {
            func: 'meeting.speakingStateChanged',
            args: [speakingState],
          },
        } as DOMMessageEvent);

        expect(handlerCalled).toBeTruthy();
        expect(returnedSpeakingState).toBe(speakingState);
      });

      it('should successfully register a handler for when the array of participants speaking changes and frameContext=meetingStage', async () => {
        await utils.initializeWithContext(FrameContexts.meetingStage);
        const speakingState: meeting.ISpeakingState = { isSpeakingDetected: true };

        let handlerCalled = false;
        let returnedSpeakingState: meeting.ISpeakingState | null;

        meeting.registerSpeakingStateChangeHandler((eventData: meeting.ISpeakingState) => {
          handlerCalled = true;
          returnedSpeakingState = eventData;
        });

        const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
        expect(registerHandlerMessage).not.toBeNull();
        expect(registerHandlerMessage.args.length).toBe(1);
        expect(registerHandlerMessage.args[0]).toBe('meeting.speakingStateChanged');

        await utils.respondToFramelessMessage({
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
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const raiseHandState: meeting.RaiseHandStateChangedEventData = {
          raiseHandState: { isHandRaised: true },
        };

        let handlerCalled = false;
        let response: meeting.RaiseHandStateChangedEventData;

        meeting.registerRaiseHandStateChangedHandler((eventData: meeting.RaiseHandStateChangedEventData) => {
          handlerCalled = true;
          response = eventData;
        });

        const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
        expect(registerHandlerMessage).not.toBeNull();
        expect(registerHandlerMessage.args.length).toBe(1);
        expect(registerHandlerMessage.args[0]).toBe('meeting.raiseHandStateChanged');

        await utils.respondToFramelessMessage({
          data: {
            func: 'meeting.raiseHandStateChanged',
            args: [raiseHandState],
          },
        } as DOMMessageEvent);

        expect(handlerCalled).toBeTruthy();
        expect(response).toBe(raiseHandState);
      });

      it('should successfully register a handler for when the raiseHandState changes and frameContext=meetingStage', async () => {
        await utils.initializeWithContext(FrameContexts.meetingStage);
        const raiseHandState: meeting.RaiseHandStateChangedEventData = {
          raiseHandState: { isHandRaised: true },
        };

        let handlerCalled = false;
        let response: meeting.RaiseHandStateChangedEventData;

        meeting.registerRaiseHandStateChangedHandler((eventData: meeting.RaiseHandStateChangedEventData) => {
          handlerCalled = true;
          response = eventData;
        });

        const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
        expect(registerHandlerMessage).not.toBeNull();
        expect(registerHandlerMessage.args.length).toBe(1);
        expect(registerHandlerMessage.args[0]).toBe('meeting.raiseHandStateChanged');

        await utils.respondToFramelessMessage({
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
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const meetingReaction: meeting.MeetingReactionReceivedEventData = {
          meetingReactionType: meeting.MeetingReactionType.like,
        };

        let handlerCalled = false;
        let response: meeting.MeetingReactionReceivedEventData;

        meeting.registerMeetingReactionReceivedHandler((eventData: meeting.MeetingReactionReceivedEventData) => {
          handlerCalled = true;
          response = eventData;
        });

        const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
        expect(registerHandlerMessage).not.toBeNull();
        expect(registerHandlerMessage.args.length).toBe(1);
        expect(registerHandlerMessage.args[0]).toBe('meeting.meetingReactionReceived');

        await utils.respondToFramelessMessage({
          data: {
            func: 'meeting.meetingReactionReceived',
            args: [meetingReaction],
          },
        } as DOMMessageEvent);

        expect(handlerCalled).toBeTruthy();
        expect(response).toBe(meetingReaction);
      });

      it('should successfully register a handler for when a meetingReaction is received and frameContext=meetingStage', async () => {
        await utils.initializeWithContext(FrameContexts.meetingStage);
        const meetingReaction: meeting.MeetingReactionReceivedEventData = {
          meetingReactionType: meeting.MeetingReactionType.like,
        };

        let handlerCalled = false;
        let response: meeting.MeetingReactionReceivedEventData;

        meeting.registerMeetingReactionReceivedHandler((eventData: meeting.MeetingReactionReceivedEventData) => {
          handlerCalled = true;
          response = eventData;
        });

        const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
        expect(registerHandlerMessage).not.toBeNull();
        expect(registerHandlerMessage.args.length).toBe(1);
        expect(registerHandlerMessage.args[0]).toBe('meeting.meetingReactionReceived');

        await utils.respondToFramelessMessage({
          data: {
            func: 'meeting.meetingReactionReceived',
            args: [meetingReaction],
          },
        } as DOMMessageEvent);

        expect(handlerCalled).toBeTruthy();
        expect(response).toBe(meetingReaction);
      });
    });

    describe('joinMeeting', () => {
      const dataError = 'Something went wrong...';

      const mockjoinMeetingParams: meeting.JoinMeetingParams = {
        joinWebUrl: new URL('https://example.com'),
        source: meeting.EventActionSource.Other,
      };

      it('should reject if mockjoinMeetingParams is not provided', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        const response = meeting.joinMeeting(null);
        await expect(response).rejects.toThrowError('Invalid joinMeetingParams');
      });

      it('should reject if joinWebUrl is not provided', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        const response = meeting.joinMeeting({
          ...mockjoinMeetingParams,
          joinWebUrl: null,
        });
        await expect(response).rejects.toThrowError('Invalid joinMeetingParams');
      });

      it('FRAMELESS: should successfully send the joinMeeting message', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        const promise = meeting.joinMeeting({
          ...mockjoinMeetingParams,
          source: meeting.EventActionSource.M365CalendarGridContextMenu,
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        await utils.respondToFramelessMessage({
          data: {
            id: joinMeetingMessage?.id,
            args: [null, true],
          },
        } as DOMMessageEvent);

        await expect(promise).resolves.not.toThrow();
        await expect(promise).resolves.toBe(true);
        expect(joinMeetingMessage?.args?.length).toEqual(1);
        expect(joinMeetingMessage?.args?.at(0)).toEqual({
          joinWebUrl: 'https://example.com/',
          source: meeting.EventActionSource.M365CalendarGridContextMenu,
        });
      });

      it('FRAMELESS: should resolve if source is not provided', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        const promise = meeting.joinMeeting({
          joinWebUrl: new URL('https://example.com/'),
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        if (joinMeetingMessage && joinMeetingMessage.args) {
          const data = {
            success: true,
          };

          await utils.respondToFramelessMessage({
            data: {
              id: joinMeetingMessage?.id,
              args: [null, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.not.toThrow();
          await expect(promise).resolves.toBe(true);
          expect(joinMeetingMessage).not.toBeNull();
          expect(joinMeetingMessage.args.length).toEqual(1);
          expect(joinMeetingMessage?.args?.at(0)).toEqual({
            joinWebUrl: 'https://example.com/',
            source: meeting.EventActionSource.Other,
          });
        }
      });

      it('FRAMELESS: should resolve if joinWebUrl is correct URL in string format', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        const promise = meeting.joinMeeting({
          joinWebUrl: new URL('https://example.com/'),
          source: meeting.EventActionSource.M365CalendarGridEventCardJoinButton,
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        await utils.respondToFramelessMessage({
          data: {
            id: joinMeetingMessage?.id,
            args: [null, true],
          },
        } as DOMMessageEvent);

        await expect(promise).resolves.not.toThrow();
        await expect(promise).resolves.toBe(true);
        expect(joinMeetingMessage?.args?.length).toEqual(1);
        expect(joinMeetingMessage?.args?.at(0)).toEqual({
          joinWebUrl: 'https://example.com/',
          source: meeting.EventActionSource.M365CalendarGridEventCardJoinButton,
        });
      });

      it('FRAMELESS: should successfully throw if the joinMeeting message sends and fails', async () => {
        await utils.initializeWithContext(FrameContexts.content);

        const promise = meeting.joinMeeting({
          ...mockjoinMeetingParams,
        });

        const joinMeetingMessage = utils.findMessageByFunc('meeting.joinMeeting');
        expect(joinMeetingMessage).not.toBeNull();

        await utils.respondToFramelessMessage({
          data: {
            id: joinMeetingMessage?.id,
            args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
          },
        } as DOMMessageEvent);
        await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
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
            await utils.initializeWithContext(context);
            meeting.appShareButton.setOptions(shareInformation);
            const toggleAppShareButtonMessage = utils.findMessageByFunc('meeting.appShareButton.setOptions');
            expect(toggleAppShareButtonMessage).not.toBeNull();
            expect(toggleAppShareButtonMessage.args.length).toBe(1);
            expect(toggleAppShareButtonMessage.args[0]).toStrictEqual(shareInformation);
          });

          it(`should successfully set false isVisible and contentUrl to be bad Url. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            let invalidUrl = 'www.xyz.com';
            shareInformation.contentUrl = invalidUrl;
            expect(() => meeting.appShareButton.setOptions(shareInformation)).toThrowError(
              `Invalid URL: ${invalidUrl}`,
            );
          });

          it(`should successfully set false isVisible and contentUrl to be undefined. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            let newShareInformation: meeting.appShareButton.ShareInformation = {
              isVisible: false,
            };
            meeting.appShareButton.setOptions(newShareInformation);
            const toggleAppShareButtonMessage = utils.findMessageByFunc(
              'meeting.appShareButton.setOptions',
            ) as MessageRequest;
            expect(toggleAppShareButtonMessage).not.toBeNull();
            expect(toggleAppShareButtonMessage.args.length).toBe(1);
            expect(toggleAppShareButtonMessage.args[0].isVisible).toBe(false);
            expect(toggleAppShareButtonMessage.args[0].contentUrl).toBe(undefined);
          });
        } else {
          it(`should not successfully shareInformation. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
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
          meeting.requestAppAudioHandling(
            { isAppHandlingAudio: true, micMuteStateChangedCallback: null },
            emptyCallBack,
          ),
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
            await utils.initializeWithContext(context);

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

            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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

            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
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
            await utils.initializeWithContext(context);

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
            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, requestIsHostAudioless],
              },
            } as DOMMessageEvent);

            // check that the registerHandler for mic state was called
            const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
            expect(registerHandlerMessage).not.toBeNull();
            expect(registerHandlerMessage.args.length).toBe(1);
            expect(registerHandlerMessage.args[0]).toBe('meeting.micStateChanged');

            // respond to the registerHandler
            await utils.respondToFramelessMessage({
              data: {
                func: 'meeting.micStateChanged',
                args: [{ isMicMuted: true }],
              },
            } as DOMMessageEvent);
            await waitForEventQueue();

            expect(micCallbackCalled).toBe(true);
          });

          it(`should call meeting.audioDeviceSelectionChanged after meeting.requestAppAudioHandling. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            const requestIsHostAudioless: boolean | null = true;

            let callbackPayload: meeting.AudioDeviceSelection | undefined = undefined;
            const testCallback = (payload: meeting.AudioDeviceSelection) => {
              callbackPayload = payload;
              return Promise.resolve();
            };

            // call and respond to requestAppAudioHandling
            meeting.requestAppAudioHandling(
              {
                isAppHandlingAudio: requestIsHostAudioless,
                micMuteStateChangedCallback: (micState: meeting.MicState) => Promise.resolve(micState),
                audioDeviceSelectionChangedCallback: testCallback,
              },
              (_result: boolean) => {},
            );
            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, requestIsHostAudioless],
              },
            } as DOMMessageEvent);

            // check that the registerHandler for audio device selection was called
            const registerHandlerMessage = utils.findMessageByFunc('registerHandler', 1);
            expect(registerHandlerMessage).not.toBeNull();
            expect(registerHandlerMessage.args.length).toBe(1);
            expect(registerHandlerMessage.args[0]).toBe('meeting.audioDeviceSelectionChanged');

            const mockPayload = {};

            // respond to the registerHandler
            await utils.respondToFramelessMessage({
              data: {
                func: 'meeting.audioDeviceSelectionChanged',
                args: [mockPayload],
              },
            } as DOMMessageEvent);
            await waitForEventQueue();

            expect(callbackPayload).toBe(mockPayload);
          });

          it(`should call meeting.updateMicState with HostInitiated reason when mic state matches. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

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
            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, requestIsHostAudioless],
              },
            } as DOMMessageEvent);

            // respond to the registerHandler
            const passedInIsMicMuted = false;
            await utils.respondToFramelessMessage({
              data: {
                func: 'meeting.micStateChanged',
                args: [{ isMicMuted: passedInIsMicMuted }],
              },
            } as DOMMessageEvent);
            await waitForEventQueue();

            const updateMicStateMessage = utils.findMessageByFunc('meeting.updateMicState');
            expect(updateMicStateMessage).not.toBeNull();
            expect(updateMicStateMessage.args.length).toBe(2);
            expect(updateMicStateMessage.args[0]).toMatchObject({ isMicMuted: passedInIsMicMuted });
            expect(updateMicStateMessage.args[1]).toEqual(0 /* MicStateChangeReason.HostInitiated */);
          });

          it(`should call meeting.updateMicState with AppDeclinedToChange reason when mic state doesn't match. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

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
            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, requestIsHostAudioless],
              },
            } as DOMMessageEvent);

            // respond to the registerHandler
            const passedInIsMicMuted = false;
            await utils.respondToFramelessMessage({
              data: {
                func: 'meeting.micStateChanged',
                args: [{ isMicMuted: passedInIsMicMuted }],
              },
            } as DOMMessageEvent);
            await waitForEventQueue();

            const updateMicStateMessage = utils.findMessageByFunc('meeting.updateMicState');
            expect(updateMicStateMessage).not.toBeNull();
            expect(updateMicStateMessage.args.length).toBe(2);
            expect(updateMicStateMessage.args[0]).toMatchObject({ isMicMuted: !passedInIsMicMuted }); // expect different value than what was passed in
            expect(updateMicStateMessage.args[1]).toEqual(2 /* MicStateChangeReason.AppDeclinedToChange */);
          });

          it(`should call meeting.updateMicState with AppFailedToChange reason when mic callback throws. context: ${context}`, async () => {
            await utils.initializeWithContext(context);

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
            const requestAppAudioHandlingMessage = utils.findMessageByFunc('meeting.requestAppAudioHandling');
            expect(requestAppAudioHandlingMessage).not.toBeNull();

            const callbackId = requestAppAudioHandlingMessage.id;
            await utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [null, requestIsHostAudioless],
              },
            } as DOMMessageEvent);

            // respond to the registerHandler
            const passedInIsMicMuted = false;
            await utils.respondToFramelessMessage({
              data: {
                func: 'meeting.micStateChanged',
                args: [{ isMicMuted: passedInIsMicMuted }],
              },
            } as DOMMessageEvent);

            await waitForEventQueue();

            const updateMicStateMessage = utils.findMessageByFunc('meeting.updateMicState');
            expect(updateMicStateMessage).not.toBeNull();
            expect(updateMicStateMessage.args[1]).toEqual(3 /* MicStateChangeReason.AppFailedToChange */);
          });
        } else {
          it(`should not allow meeting.requestAppAudioHandling calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);

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
            await utils.initializeWithContext(context);

            const micState: meeting.MicState = { isMicMuted: false };
            meeting.updateMicState(micState);

            const updateMicStateMessage = utils.findMessageByFunc('meeting.updateMicState');
            expect(updateMicStateMessage).not.toBeNull();
            expect(updateMicStateMessage?.args[0]).toMatchObject(micState);
            expect(updateMicStateMessage?.args[1]).toEqual(1 /* MicStateChangeReason.AppInitiated */);
          });
        } else {
          it(`should not allow meeting.updateMicState calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
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
});
