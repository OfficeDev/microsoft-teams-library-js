import { meeting, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const GetIncomingClientAudioState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getIncomingClientAudioState',
    title: 'Get Incoming Client Audio State',
    onClick: {
      withPromise: async () => {
        const result = await meeting.getIncomingClientAudioState();
        return result.toString();
      },
      withCallback: setResult => {
        const callback = (error: SdkError | null, result: boolean | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(result));
          }
        };
        meeting.getIncomingClientAudioState(callback);
      },
    },
  });

const ToggleIncomingClientAudioState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'toggleIncomingClientAudio',
    title: 'Toggle Incoming Client Audio',
    onClick: {
      withPromise: async () => {
        const result = await meeting.toggleIncomingClientAudio();
        return result.toString();
      },
      withCallback: setResult => {
        const callback = (error: SdkError | null, result: boolean | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(result));
          }
        };
        meeting.toggleIncomingClientAudio(callback);
      },
    },
  });

const GetMeetingDetails = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getMeetingDetails',
    title: 'Get Meeting Details',
    onClick: {
      withPromise: async () => {
        const result = await meeting.getMeetingDetails();
        return JSON.stringify(result);
      },
      withCallback: setResult => {
        const callback = (error: SdkError | null, meetingDetails: meeting.IMeetingDetails | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(meetingDetails));
          }
        };
        meeting.getMeetingDetails(callback);
      },
    },
  });

const GetAuthenticationTokenForAnonymousUser = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAuthTokenForAnonymousUser',
    title: 'Get Auth Token For Anonymous User',
    onClick: {
      withPromise: async () => {
        const result = await meeting.getAuthenticationTokenForAnonymousUser();
        return result;
      },
      withCallback: setResult => {
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
      },
    },
  });

const GetLiveStreamState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getLiveStreamState',
    title: 'Get LiveStream State',
    onClick: {
      withPromise: async () => {
        const result = await meeting.getLiveStreamState();
        return result ? result.isStreaming.toString() : 'null';
      },
      withCallback: setResult => {
        const callback = (error: SdkError | null, liveStreamState: meeting.LiveStreamState | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(liveStreamState?.isStreaming));
          }
        };
        meeting.getLiveStreamState(callback);
      },
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
      validateInput: input => {
        if (!input.streamUrl) {
          throw new Error('streamUrl is required.');
        }
      },
      submit: {
        withPromise: async input => {
          if (input.streamKey) {
            await meeting.requestStartLiveStreaming(input.streamUrl, input.streamKey);
          } else {
            await meeting.requestStartLiveStreaming(input.streamUrl);
          }

          return 'Complete';
        },
        withCallback: (input, setResult) => {
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
        },
      },
    },
  });

const RequestStopLiveStreaming = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestStopLiveStreaming',
    title: 'Request Stop LiveStreaming',
    onClick: {
      withPromise: async () => {
        await meeting.requestStopLiveStreaming();
        return 'Complete';
      },
      withCallback: setResult => {
        const callback = (error: SdkError | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult('Complete');
          }
        };
        meeting.requestStopLiveStreaming(callback);
      },
    },
  });

const RegisterLiveStreamChangedHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerLiveStreamChangedHandler',
    title: 'Register LiveStream Changed Handler',
    onClick: async setResult => {
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

const ShareAppContentToStage = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'shareAppContentToStage',
    title: 'Share App Content To Stage',
    onClick: {
      validateInput: () => {
        // TODO: update the validation once the E2E scenario test is updated.
      },
      submit: {
        withPromise: async input => {
          await meeting.shareAppContentToStage(input);
          return 'shareAppContentToStage() succeeded';
        },
        withCallback: (input, setResult) => {
          const callback = (error: SdkError | null, result: boolean | null): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('shareAppContentToStage() succeeded');
            }
          };
          meeting.shareAppContentToStage(callback, input);
        },
      },
    },
  });

const MeetingCapabilityCheck = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMeetingCapability',
    title: 'Check Meeting Capability',
    onClick: async () => `Meeting module ${meeting.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetAppContentStageSharingCapabilities = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAppContentStageSharingCapabilities',
    title: 'Get App Content Stage Sharing Capabilities',
    onClick: {
      withPromise: async () => {
        const result = await meeting.getAppContentStageSharingCapabilities();
        return 'getAppContentStageSharingCapabilities() succeeded: ' + JSON.stringify(result);
      },
      withCallback: setResult => {
        const callback = (
          error: SdkError | null,
          appContentStageSharingCapabilities: meeting.IAppContentStageSharingCapabilities | null,
        ): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(
              'getAppContentStageSharingCapabilities() succeeded: ' +
                JSON.stringify(appContentStageSharingCapabilities),
            );
          }
        };
        meeting.getAppContentStageSharingCapabilities(callback);
      },
    },
  });

const StopSharingAppContentToStage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'stopSharingAppContentToStage',
    title: 'Stop Sharing App Content To Stage',
    onClick: {
      withPromise: async () => {
        const result = await meeting.stopSharingAppContentToStage();
        return 'stopSharingAppContentToStage() succeeded: ' + result;
      },
      withCallback: setResult => {
        const callback = (error: SdkError | null, result: boolean | null): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult('stopSharingAppContentToStage() succeeded: ' + JSON.stringify(result));
          }
        };
        meeting.stopSharingAppContentToStage(callback);
      },
    },
  });

const GetAppContentStageSharingState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAppContentStageSharingState',
    title: 'Get App Content Stage Sharing State',
    onClick: {
      withPromise: async () => {
        const result = await meeting.getAppContentStageSharingState();
        return 'getAppContentStageSharingState() succeeded: ' + JSON.stringify(result);
      },
      withCallback: setResult => {
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
      },
    },
  });

const MeetingAPIs = (): ReactElement => (
  <>
    <h1>meeting</h1>
    <GetIncomingClientAudioState />
    <ToggleIncomingClientAudioState />
    <GetMeetingDetails />
    <GetAuthenticationTokenForAnonymousUser />
    <GetLiveStreamState />
    <RequestStartLiveStreaming />
    <RequestStopLiveStreaming />
    <RegisterLiveStreamChangedHandler />
    <ShareAppContentToStage />
    <MeetingCapabilityCheck />
    <GetAppContentStageSharingCapabilities />
    <StopSharingAppContentToStage />
    <GetAppContentStageSharingState />
  </>
);

export default MeetingAPIs;
