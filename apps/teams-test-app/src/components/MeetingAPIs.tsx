import { meeting, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const GetIncomingClientAudioState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getIncomingClientAudioState',
    title: 'Get Incoming Client Audio State',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null, result: boolean | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(JSON.stringify(result));
        }
      };
      meeting.getIncomingClientAudioState(callback);
      return '';
    },
  });

const ToggleIncomingClientAudioState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'toggleIncomingClientAudio',
    title: 'Toggle Incoming Client Audio',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null, result: boolean | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(JSON.stringify(result));
        }
      };
      meeting.toggleIncomingClientAudio(callback);
      return '';
    },
  });

const GetMeetingDetails = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getMeetingDetails',
    title: 'Get Meeting Details',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null, meetingDetails: meeting.IMeetingDetailsResponse | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(JSON.stringify(meetingDetails));
        }
      };
      meeting.getMeetingDetails(callback);
      return '';
    },
  });

const GetAuthenticationTokenForAnonymousUser = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAuthTokenForAnonymousUser',
    title: 'Get Auth Token For Anonymous User',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null, authenticationTokenOfAnonymousUser: string | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else if (authenticationTokenOfAnonymousUser) {
          setResult(authenticationTokenOfAnonymousUser);
        } else {
          setResult('getAuthTokenForAnonymousUser was called but nothing was returned');
        }
      };
      meeting.getAuthenticationTokenForAnonymousUser(callback);
      return '';
    },
  });

const GetLiveStreamState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getLiveStreamState',
    title: 'Get LiveStream State',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null, liveStreamState: meeting.LiveStreamState | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(JSON.stringify(liveStreamState?.isStreaming));
        }
      };
      meeting.getLiveStreamState(callback);
      return '';
    },
  });

interface RequestStartLiveStreamingParams {
  streamUrl: string;
  streamKey?: string;
}

const RequestStartLiveStreaming = (): React.ReactElement =>
  ApiWithTextInput<RequestStartLiveStreamingParams>({
    name: 'requestStartLiveStreaming',
    title: 'Request Start LiveStreaming',
    onClick: {
      validateInput: (input) => {
        if (!input.streamUrl) {
          throw new Error('streamUrl is required.');
        }
      },
      submit: async (input, setResult) => {
        const callback = (error: SdkError | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult('Complete');
          }
        };
        if (input.streamKey) {
          meeting.requestStartLiveStreaming(callback, input.streamUrl, input.streamKey);
        } else {
          meeting.requestStartLiveStreaming(callback, input.streamUrl);
        }
        return '';
      },
    },
  });

const RequestStopLiveStreaming = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestStopLiveStreaming',
    title: 'Request Stop LiveStreaming',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult('Complete');
        }
      };
      meeting.requestStopLiveStreaming(callback);
      return '';
    },
  });

const RegisterLiveStreamChangedHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerLiveStreamChangedHandler',
    title: 'Register LiveStream Changed Handler',
    onClick: async (setResult) => {
      const handler = (liveStreamState: meeting.LiveStreamState): void => {
        let res = `Live StreamState changed to ${liveStreamState.isStreaming}`;
        if (liveStreamState.error) {
          res += ` with error ${JSON.stringify(liveStreamState.error)}`;
        }
        setResult(res);
      };
      meeting.registerLiveStreamChangedHandler(handler);

      return generateRegistrationMsg('then the live stream state changes');
    },
  });

const RegisterRaiseHandStateChangedHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerRaiseHandStateChangedHandler',
    title: 'Register RaiseHandState Changed Handler',
    onClick: async (setResult) => {
      const handler = (eventData: meeting.RaiseHandStateChangedEventData): void => {
        let res;
        if (eventData.error) {
          res = `Receieved error ${JSON.stringify(eventData.error)}`;
        } else {
          res = `RaiseHand state changed to ${JSON.stringify(eventData.raiseHandState)}`;
        }
        setResult(res);
      };
      meeting.registerRaiseHandStateChangedHandler(handler);

      return generateRegistrationMsg('the raise hand state changes');
    },
  });

const RegisterMeetingReactionReceivedHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerMeetingReactionReceivedHandler',
    title: 'Register Meeting Reaction Received Handler',
    onClick: async (setResult) => {
      const handler = (eventData: meeting.MeetingReactionReceivedEventData): void => {
        let res;
        if (eventData.error) {
          res = `Receieved error ${JSON.stringify(eventData.error)}`;
        } else {
          res = `Received ${JSON.stringify(eventData.meetingReactionType)}`;
        }
        setResult(res);
      };
      meeting.registerMeetingReactionReceivedHandler(handler);

      return generateRegistrationMsg('meeting reaction received');
    },
  });

const RegisterSpeakingStateChangedHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerSpeakingStateChangedHandler',
    title: 'Register SpeakingState Changed Handler',
    onClick: async (setResult) => {
      const handler = (eventData: meeting.ISpeakingState): void => {
        let res;
        if (eventData.error) {
          res = `Receieved error ${JSON.stringify(eventData.error)}`;
        } else {
          res = `Speaking state changed to ${JSON.stringify(eventData.isSpeakingDetected)}`;
        }
        setResult(res);
      };
      meeting.registerSpeakingStateChangeHandler(handler);

      return generateRegistrationMsg('the speaking state changes');
    },
  });

const ShareAppContentToStage = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'shareAppContentToStage',
    title: 'Share App Content To Stage',
    onClick: {
      validateInput: () => {
        // TODO: update the validation once the E2E scenario test is updated.
      },
      submit: async (input, setResult) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const callback = (error: SdkError | null, result: boolean | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult('shareAppContentToStage() succeeded');
          }
        };
        meeting.shareAppContentToStage(callback, input);
        return '';
      },
    },
  });

const GetAppContentStageSharingCapabilities = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAppContentStageSharingCapabilities',
    title: 'Get App Content Stage Sharing Capabilities',
    onClick: async (setResult) => {
      const callback = (
        error: SdkError | null,
        appContentStageSharingCapabilities: meeting.IAppContentStageSharingCapabilities | null,
      ): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(
            'getAppContentStageSharingCapabilities() succeeded: ' + JSON.stringify(appContentStageSharingCapabilities),
          );
        }
      };
      meeting.getAppContentStageSharingCapabilities(callback);
      return '';
    },
  });

const StopSharingAppContentToStage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'stopSharingAppContentToStage',
    title: 'Stop Sharing App Content To Stage',
    onClick: async (setResult) => {
      const callback = (error: SdkError | null, result: boolean | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult('stopSharingAppContentToStage() succeeded: ' + JSON.stringify(result));
        }
      };
      meeting.stopSharingAppContentToStage(callback);
      return '';
    },
  });

const GetAppContentStageSharingState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAppContentStageSharingState',
    title: 'Get App Content Stage Sharing State',
    onClick: async (setResult) => {
      const callback = (
        error: SdkError | null,
        appContentStageSharingState: meeting.IAppContentStageSharingState | null,
      ): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult('getAppContentStageSharingState() succeeded: ' + JSON.stringify(appContentStageSharingState));
        }
      };
      meeting.getAppContentStageSharingState(callback);
      return '';
    },
  });

interface ShareInformation {
  isVisible: boolean;
  contentUrl?: string;
}

const SetOptions = (): React.ReactElement =>
  ApiWithTextInput<ShareInformation>({
    name: 'setOptions',
    title: 'Set App Share Button options',
    onClick: {
      validateInput: (input) => {
        if (typeof input.isVisible !== 'boolean') {
          throw new Error('input.isVisible should be boolean');
        }
        if (input.contentUrl) {
          new URL(input.contentUrl);
        }
      },
      submit: async (input) => {
        meeting.appShareButton.setOptions(input);
        return '';
      },
    },
  });

const RequestAppAudioHandling = (): React.ReactElement =>
  ApiWithTextInput<meeting.MicState>({
    name: 'requestAppAudioHandling',
    title: 'App Handles the Audio channel',
    onClick: {
      validateInput: (input) => {
        if (typeof input.isMicMuted !== 'boolean') {
          throw new Error('input.isMicMuted should be boolean');
        }
      },
      submit: async (input, setResult) => {
        const callback = (isHostAudioless: boolean | null): void => {
          setResult('requestAppAudioHandling() succeeded: isHostAudioless=' + isHostAudioless);
        };
        const micMuteStateChangedCallback = (micState: meeting.MicState): Promise<meeting.MicState> =>
          new Promise((resolve, reject) => {
            if (!micState) {
              reject('micStatus should not be null');
              throw new Error();
            } else {
              setResult('requestAppAudioHandling() mic mute state changed: ' + micState.isMicMuted);
              resolve(micState);
            }
          });
        const requestAppAudioHandlingParams: meeting.RequestAppAudioHandlingParams = {
          isAppHandlingAudio: input.isMicMuted,
          micMuteStateChangedCallback: micMuteStateChangedCallback,
        };
        meeting.requestAppAudioHandling(requestAppAudioHandlingParams, callback);
        return '';
      },
    },
  });

const UpdateMicState = (): React.ReactElement =>
  ApiWithTextInput<meeting.MicState>({
    name: 'updateMicState',
    title: 'Send Mic mute status response acknowledgement',
    onClick: {
      validateInput: (input) => {
        if (typeof input.isMicMuted !== 'boolean') {
          throw new Error('input.isMicMuted should be boolean');
        }
      },
      submit: async (input, setResult) => {
        meeting.updateMicState(input);
        setResult('updateMicState() succeeded');
        return `updateMicState called with micState: isMicMuted:${input}`;
      },
    },
  });

const MeetingAPIs = (): ReactElement => (
  <ModuleWrapper title="Meeting">
    <GetIncomingClientAudioState />
    <ToggleIncomingClientAudioState />
    <GetMeetingDetails />
    <GetAuthenticationTokenForAnonymousUser />
    <GetLiveStreamState />
    <RequestStartLiveStreaming />
    <RequestStopLiveStreaming />
    <RegisterLiveStreamChangedHandler />
    <RegisterRaiseHandStateChangedHandler />
    <RegisterMeetingReactionReceivedHandler />
    <RegisterSpeakingStateChangedHandler />
    <ShareAppContentToStage />
    <GetAppContentStageSharingCapabilities />
    <StopSharingAppContentToStage />
    <GetAppContentStageSharingState />
    <SetOptions />
    <RequestAppAudioHandling />
    <UpdateMicState />
  </ModuleWrapper>
);

export default MeetingAPIs;
