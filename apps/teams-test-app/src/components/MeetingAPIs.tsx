import { meeting } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const GetIncomingClientAudioState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getIncomingClientAudioState',
    title: 'Get Incoming Client Audio State',
    onClick: async () => {
      const result = await meeting.getIncomingClientAudioState();
      return result.toString();
    },
  });

const ToggleIncomingClientAudioState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'toggleIncomingClientAudio',
    title: 'Toggle Incoming Client Audio',
    onClick: async () => {
      const result = await meeting.toggleIncomingClientAudio();
      return result.toString();
    },
  });

const GetMeetingDetails = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getMeetingDetails',
    title: 'Get Meeting Details',
    onClick: async () => {
      const result = await meeting.getMeetingDetails();
      return JSON.stringify(result);
    },
  });

const GetAuthenticationTokenForAnonymousUser = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAuthTokenForAnonymousUser',
    title: 'Get Auth Token For Anonymous User',
    onClick: async () => {
      const result = await meeting.getAuthenticationTokenForAnonymousUser();
      return result;
    },
  });

const GetLiveStreamState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getLiveStreamState',
    title: 'Get LiveStream State',
    onClick: async () => {
      const result = await meeting.getLiveStreamState();
      return result ? result.isStreaming.toString() : 'null';
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
      submit: async input => {
        if (input.streamKey) {
          await meeting.requestStartLiveStreaming(input.streamUrl, input.streamKey);
        } else {
          await meeting.requestStartLiveStreaming(input.streamUrl);
        }

        return 'Complete';
      },
    },
  });

const RequestStopLiveStreaming = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestStopLiveStreaming',
    title: 'Request Stop LiveStreaming',
    onClick: async () => {
      await meeting.requestStopLiveStreaming();
      return 'Complete';
    },
  });

const RegisterLiveStreamChangedHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerLiveStreamChangedHandler',
    title: 'Register LiveStream Changed Handler',
    onClick: async setResult => {
      const handler = (liveStreamState: meeting.LiveStreamState): void => {
        setResult('Live StreamState changed to ' + liveStreamState.isStreaming);
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
      submit: async input => {
        await meeting.shareAppContentToStage(input);
        return 'shareAppContentToStage() succeeded';
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
    onClick: async () => {
      const result = await meeting.getAppContentStageSharingCapabilities();
      return 'getAppContentStageSharingCapabilities() succeeded: ' + JSON.stringify(result);
    },
  });

const StopSharingAppContentToStage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'stopSharingAppContentToStage',
    title: 'Stop Sharing App Content To Stage',
    onClick: async () => {
      const result = await meeting.stopSharingAppContentToStage();
      return 'stopSharingAppContentToStage() succeeded: ' + result;
    },
  });

const GetAppContentStageSharingState = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getAppContentStageSharingState',
    title: 'Get App Content Stage Sharing State',
    onClick: async () => {
      const result = await meeting.getAppContentStageSharingState();
      return 'getAppContentStageSharingState() succeeded: ' + JSON.stringify(result);
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
