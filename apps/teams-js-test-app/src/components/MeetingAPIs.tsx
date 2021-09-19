import { meeting, meetingRoom } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const MeetingAPIs = (): ReactElement => {
  const [getIncomingClientAudioStateRes, setGetIncomingClientAudioStateRes] = React.useState('');
  const [toggleIncomingClientAudioRes, setToggleIncomingClientAudioRes] = React.useState('');
  const [getMeetingDetailsRes, setGetMeetingDetailsRes] = React.useState('');
  const [getAuthenticationTokenRes, setGetAuthenticationTokenRes] = React.useState('');
  const [getLiveStreamStateRes, setGetLiveStreamStateRes] = React.useState('');
  const [requestStartLiveStreamingRes, setRequestStartLiveStreamingRes] = React.useState('');
  const [requestStopLiveStreamingRes, setRequestStopLiveStreamingRes] = React.useState('');
  const [registerLiveStreamChangedHandlerRes, setRegisterLiveStreamChangedHandlerRes] = React.useState('');
  const [shareAppContentToStageRes, setShareAppContentToStageRes] = React.useState('');
  const [getPairedMeetingRoomInfoRes, setGetPairedMeetingRoomInfoRes] = React.useState('');
  const [sendCommandToPairedMeetingRoomRes, setSendCommandToPairedMeetingRoomRes] = React.useState('');
  const [registerMeetingRoomCapUpdateHandlerRes, setRegisterMeetingRoomCapUpdateHandlerRes] = React.useState('');
  const [registerMeetingRoomStatesUpdateHandlerRes, setRegisterMeetingRoomStatesUpdateHandlerRes] = React.useState('');
  const [checkMeetingCapabilityRes, setCheckMeetingCapabilityRes] = React.useState('');
  const [getAppContentStageSharingCapabilitiesRes, setGetAppContentStageSharingCapabilitiesRes] = React.useState('');
  const [stopSharingAppContentToStageRes, setStopSharingAppContentToStageRes] = React.useState('');
  const NULL = 'null';

  const getIncomingClientAudioState = (): void => {
    setGetIncomingClientAudioStateRes('getIncomingClientAudioState()' + noHubSdkMsg);
    meeting
      .getIncomingClientAudioState()
      .then(result => setGetIncomingClientAudioStateRes(result.toString()))
      .catch(err => setGetIncomingClientAudioStateRes(err.errorCode.toString() + ' ' + err.message));
  };

  const toggleIncomingClientAudio = (): void => {
    setToggleIncomingClientAudioRes('toggleIncomingClientAudio()' + noHubSdkMsg);
    meeting
      .toggleIncomingClientAudio()
      .then(result => setToggleIncomingClientAudioRes(result.toString()))
      .catch(err => setToggleIncomingClientAudioRes(err.errorCode.toString() + ' ' + err.message));
  };

  const getMeetingDetails = (): void => {
    setGetMeetingDetailsRes('meeting.getMeetingDetails()' + noHubSdkMsg);
    meeting
      .getMeetingDetails()
      .then(meetingDetails => setGetMeetingDetailsRes(JSON.stringify(meetingDetails)))
      .catch(err => setGetMeetingDetailsRes(err.errorCode.toString() + ' ' + err.message));
  };

  const getAuthenticationToken = (): void => {
    setGetAuthenticationTokenRes('meeting.getAuthenticationTokenForAnonymousUser()' + noHubSdkMsg);
    meeting
      .getAuthenticationTokenForAnonymousUser()
      .then(authToken => setGetAuthenticationTokenRes(authToken))
      .catch(err => setGetAuthenticationTokenRes(err.errorCode.toString() + ' ' + err.message));
  };

  const getLiveStreamState = (): void => {
    setGetLiveStreamStateRes('meeting.getLiveStreamState()' + noHubSdkMsg);
    meeting
      .getLiveStreamState()
      .then(liveStreamState =>
        liveStreamState
          ? setGetLiveStreamStateRes(liveStreamState.isStreaming.toString())
          : setGetLiveStreamStateRes(NULL),
      )
      .catch(error => setGetLiveStreamStateRes(JSON.stringify(error)));
  };

  const requestStartLiveStreaming = (input: string): void => {
    let streamInput;
    const STREAM_URL = 'streamUrl';
    const STREAM_KEY = 'streamKey';

    try {
      streamInput = JSON.parse(input);
    } catch (error) {
      setRequestStartLiveStreamingRes(
        `Please JSON format your input. Your input should be JSON formatted containing at least a ${STREAM_URL} and an optional ${STREAM_KEY}. For example, {"${STREAM_URL}": "https://bing.com"}`,
      );
      return;
    }

    if (streamInput.hasOwnProperty(STREAM_URL)) {
      setRequestStartLiveStreamingRes('meeting.requestStartLiveStreaming()' + noHubSdkMsg);
      (streamInput.hasOwnProperty(STREAM_KEY)
        ? meeting.requestStartLiveStreaming(streamInput.get(STREAM_URL), streamInput.get(STREAM_KEY))
        : meeting.requestStartLiveStreaming(streamInput.get(STREAM_URL))
      )
        .then(() => setRequestStartLiveStreamingRes('Complete'))
        .catch(error => setRequestStartLiveStreamingRes(JSON.stringify(error)));
    } else {
      setRequestStartLiveStreamingRes(
        `Please include a ${STREAM_URL}. Your input should be JSON formatted containing at least a ${STREAM_URL} and an optional ${STREAM_KEY}. For example, {"${STREAM_URL}": "https://bing.com"}`,
      );
    }
  };

  const requestStopLiveStreaming = (): void => {
    setRequestStopLiveStreamingRes('meeting.requestStopLiveStreaming' + noHubSdkMsg);
    meeting
      .requestStopLiveStreaming()
      .then(() => setRequestStopLiveStreamingRes('Complete'))
      .catch(error => setRequestStopLiveStreamingRes(JSON.stringify(error)));
  };

  const registerLiveStreamChangedHandler = (): void => {
    setRegisterLiveStreamChangedHandlerRes('meeting.registerLiveStreamChangedHandler' + noHubSdkMsg);
    const handler = (liveStreamState: meeting.LiveStreamState): void => {
      setRegisterLiveStreamChangedHandlerRes('Live StreamState changed to ' + liveStreamState.isStreaming.toString());
    };
    meeting.registerLiveStreamChangedHandler(handler);
  };

  const shareAppContentToStage = (appContentUrl: string): void => {
    setShareAppContentToStageRes('shareAppContentToStage' + noHubSdkMsg);
    meeting
      .shareAppContentToStage(appContentUrl)
      .then(() => setShareAppContentToStageRes('shareAppContentToStage() succeeded'))
      .catch(error => setShareAppContentToStageRes(JSON.stringify(error)));
  };

  const getPairedMeetingRoomInfo = (): void => {
    setGetPairedMeetingRoomInfoRes('getPairedMeetingRoomInfo' + noHubSdkMsg);
    meetingRoom
      .getPairedMeetingRoomInfo()
      .then(meetingRoomInfo => setGetPairedMeetingRoomInfoRes(JSON.stringify(meetingRoomInfo)))
      .catch(sdkError => setGetPairedMeetingRoomInfoRes(JSON.stringify(sdkError)));
  };

  const sendCommandToPairedMeetingRoom = (commandName: string): void => {
    setSendCommandToPairedMeetingRoomRes('sendCommandToPairedMeetingRoom' + noHubSdkMsg);
    meetingRoom
      .sendCommandToPairedMeetingRoom(commandName)
      .then(() => setSendCommandToPairedMeetingRoomRes('Success'))
      .catch(sdkError => setSendCommandToPairedMeetingRoomRes(JSON.stringify(sdkError)));
  };

  const registerMeetingRoomCapabilitiesUpdateHandler = (): void => {
    setRegisterMeetingRoomCapUpdateHandlerRes('registerMeetingRoomCapabilitiesUpdateHandler' + noHubSdkMsg);
    const handler = (cap: meetingRoom.MeetingRoomCapability): void => {
      setRegisterMeetingRoomCapUpdateHandlerRes('MeetingRoom Capabilities have been updated to ' + JSON.stringify(cap));
    };
    meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(handler);
  };

  const registerMeetingRoomStatesUpdateHandler = (): void => {
    setRegisterMeetingRoomStatesUpdateHandlerRes('registerMeetingRoomStatesUpdateHandler' + noHubSdkMsg);
    const handler = (states: meetingRoom.MeetingRoomState): void => {
      setRegisterMeetingRoomStatesUpdateHandlerRes('MeetingRoom States have been updated to ' + JSON.stringify(states));
    };
    meetingRoom.registerMeetingRoomStatesUpdateHandler(handler);
  };

  const meetingCapabilityCheck = (): void => {
    if (meeting.isSupported()) {
      setCheckMeetingCapabilityRes('Meeting module is supported');
    } else {
      setCheckMeetingCapabilityRes('Meeting module is not supported');
    }
  };

  const getAppContentStageSharingCapabilities = (): void => {
    setGetAppContentStageSharingCapabilitiesRes('getAppContentStageSharingCapabilities' + noHubSdkMsg);
    meeting
      .getAppContentStageSharingCapabilities()
      .then(appContentStageSharingCapabilities =>
        setGetAppContentStageSharingCapabilitiesRes(
          'getAppContentStageSharingCapabilities() succeeded: ' + JSON.stringify(appContentStageSharingCapabilities),
        ),
      )
      .catch(error =>
        setGetAppContentStageSharingCapabilitiesRes(
          'getAppContentStageSharingCapabilities() failed: ' + JSON.stringify(error),
        ),
      );
  };

  const stopSharingAppContentToStage = (): void => {
    setStopSharingAppContentToStageRes('stopSharingAppContentToStage' + noHubSdkMsg);
    meeting
      .stopSharingAppContentToStage()
      .then(result =>
        setStopSharingAppContentToStageRes('getAppContentStageSharingCapabilities() succeeded: ' + result),
      )
      .catch(error =>
        setStopSharingAppContentToStageRes('getAppContentStageSharingCapabilities() failed: ' + JSON.stringify(error)),
      );
  };

  return (
    <>
      <h1>meeting</h1>
      <BoxAndButton
        handleClick={getIncomingClientAudioState}
        output={getIncomingClientAudioStateRes}
        hasInput={false}
        title="Get Incoming Client Audio State"
        name="getIncomingClientAudioState"
      />
      <BoxAndButton
        handleClick={toggleIncomingClientAudio}
        output={toggleIncomingClientAudioRes}
        hasInput={false}
        title="Toggle Incoming Client Audio"
        name="toggleIncomingClientAudio"
      />
      <BoxAndButton
        handleClick={getMeetingDetails}
        output={getMeetingDetailsRes}
        hasInput={false}
        title="Get Meeting Details"
        name="getMeetingDetails"
      />
      <BoxAndButton
        handleClick={getAuthenticationToken}
        output={getAuthenticationTokenRes}
        hasInput={false}
        title="Get Auth Token For Anonymous User"
        name="getAuthTokenForAnonymousUser"
      />
      <BoxAndButton
        handleClick={getLiveStreamState}
        output={getLiveStreamStateRes}
        hasInput={false}
        title="Get LiveStream State"
        name="getLiveStreamState"
      />
      <BoxAndButton
        handleClickWithInput={requestStartLiveStreaming}
        output={requestStartLiveStreamingRes}
        hasInput={true}
        title="Request Start LiveStreaming"
        name="requestStartLiveStreaming"
      />
      <BoxAndButton
        handleClickWithInput={requestStopLiveStreaming}
        output={requestStopLiveStreamingRes}
        hasInput={false}
        title="Request Stop LiveStreaming"
        name="requestStopLiveStreaming"
      />
      <BoxAndButton
        handleClickWithInput={registerLiveStreamChangedHandler}
        output={registerLiveStreamChangedHandlerRes}
        hasInput={false}
        title="Register LiveStream Changed Handler"
        name="registerLiveStreamChangedHandler"
      />
      <BoxAndButton
        handleClickWithInput={shareAppContentToStage}
        output={shareAppContentToStageRes}
        hasInput={true}
        title="Share App Content To Stage"
        name="shareAppContentToStage"
      />
      <BoxAndButton
        handleClick={getPairedMeetingRoomInfo}
        output={getPairedMeetingRoomInfoRes}
        hasInput={false}
        title="Get Paired MeetingRoom Info"
        name="getPairedMeetingRoomInfo"
      />
      <BoxAndButton
        handleClickWithInput={sendCommandToPairedMeetingRoom}
        output={sendCommandToPairedMeetingRoomRes}
        hasInput={true}
        title="Send Command to Paired MeetingRoom"
        name="sendCommandToPairedMeetingRoom"
      />
      <BoxAndButton
        handleClick={registerMeetingRoomCapabilitiesUpdateHandler}
        output={registerMeetingRoomCapUpdateHandlerRes}
        hasInput={false}
        title="Register MeetingRoom Capabilities Update Handler"
        name="registerMeetingRoomCapUpdateHandler"
      />
      <BoxAndButton
        handleClick={registerMeetingRoomStatesUpdateHandler}
        output={registerMeetingRoomStatesUpdateHandlerRes}
        hasInput={false}
        title="Register MeetingRoom States Update Handler"
        name="registerMeetingRoomStatesUpdateHandler"
      />
      <BoxAndButton
        handleClick={meetingCapabilityCheck}
        output={checkMeetingCapabilityRes}
        hasInput={false}
        title="Check Meeting Capability"
        name="checkMeetingCapability"
      />
      <BoxAndButton
        handleClick={getAppContentStageSharingCapabilities}
        output={getAppContentStageSharingCapabilitiesRes}
        hasInput={false}
        title="Get App Content Stage Sharing Capabilities"
        name="getAppContentStageSharingCapabilities"
      />
      <BoxAndButton
        handleClick={stopSharingAppContentToStage}
        output={stopSharingAppContentToStageRes}
        hasInput={false}
        title="Stop Sharing App Content To Stage"
        name="stopSharingAppContentToStage"
      />
    </>
  );
};

export default MeetingAPIs;
