import React, { ReactElement } from 'react';
import { meeting, meetingRoom, SdkError } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

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
  const NULL = 'null';

  const getIncomingClientAudioState = (): void => {
    setGetIncomingClientAudioStateRes('getIncomingClientAudioState()' + noHubSdkMsg);
    meeting.getIncomingClientAudioState((err: SdkError | null, result: boolean | null): void => {
      if (err) {
        setGetIncomingClientAudioStateRes(err.errorCode.toString() + ' ' + err.message);
        return;
      }
      if (result !== null) {
        setGetIncomingClientAudioStateRes(result.toString());
      }
    });
  };

  const toggleIncomingClientAudio = (): void => {
    setToggleIncomingClientAudioRes('toggleIncomingClientAudio()' + noHubSdkMsg);
    meeting.toggleIncomingClientAudio((err: SdkError | null, result: boolean | null): void => {
      if (err) {
        setToggleIncomingClientAudioRes(err.errorCode.toString() + ' ' + err.message);
        return;
      }
      if (result !== null) {
        setToggleIncomingClientAudioRes(result.toString());
      }
    });
  };

  const getMeetingDetails = (): void => {
    setGetMeetingDetailsRes('meeting.getMeetingDetails()' + noHubSdkMsg);
    meeting.getMeetingDetails((err: SdkError | null, meetingDetails: meeting.IMeetingDetails | null): void => {
      if (err) {
        setGetMeetingDetailsRes(err.errorCode.toString() + ' ' + err.message);
        return;
      }
      if (meetingDetails) {
        setGetMeetingDetailsRes(JSON.stringify(meetingDetails));
      }
    });
  };

  const getAuthenticationToken = (): void => {
    setGetAuthenticationTokenRes('meeting.getAuthenticationTokenForAnonymousUser()' + noHubSdkMsg);
    meeting.getAuthenticationTokenForAnonymousUser((err: SdkError | null, authToken: string | null): void => {
      if (err) {
        setGetAuthenticationTokenRes(err.errorCode.toString() + ' ' + err.message);
        return;
      }
      if (authToken) {
        setGetAuthenticationTokenRes(authToken);
      }
    });
  };

  const getLiveStreamState = (): void => {
    setGetLiveStreamStateRes('meeting.getLiveStreamState()' + noHubSdkMsg);
    const callback = (error: SdkError | null, liveStreamState: meeting.LiveStreamState | null): void => {
      if (error) {
        setGetLiveStreamStateRes(JSON.stringify(error));
      } else {
        liveStreamState
          ? setGetLiveStreamStateRes(liveStreamState.isStreaming.toString())
          : setGetLiveStreamStateRes(NULL);
      }
    };
    meeting.getLiveStreamState(callback);
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
      const callback = (error: SdkError | null): void => {
        if (error) {
          setRequestStartLiveStreamingRes(JSON.stringify(error));
        }
      };
      streamInput.hasOwnProperty(STREAM_KEY)
        ? meeting.requestStartLiveStreaming(callback, streamInput.get(STREAM_URL), streamInput.get(STREAM_KEY))
        : meeting.requestStartLiveStreaming(callback, streamInput.get(STREAM_URL));
    } else {
      setRequestStartLiveStreamingRes(
        `Please include a ${STREAM_URL}. Your input should be JSON formatted containing at least a ${STREAM_URL} and an optional ${STREAM_KEY}. For example, {"${STREAM_URL}": "https://bing.com"}`,
      );
    }
  };

  const requestStopLiveStreaming = (): void => {
    setRequestStopLiveStreamingRes('meeting.requestStopLiveStreaming' + noHubSdkMsg);
    const callback = (error: SdkError | null): void => {
      if (error) {
        setRequestStopLiveStreamingRes(JSON.stringify(error));
      }
    };
    meeting.requestStopLiveStreaming(callback);
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
    const handler = (error: SdkError | null, result: boolean | null): void => {
      if (error) {
        setShareAppContentToStageRes(JSON.stringify(error));
      } else {
        if (result) {
          setShareAppContentToStageRes('shareAppContentToStage() succeeded');
        } else {
          setShareAppContentToStageRes('shareAppContentToStage() failed');
        }
      }
    };
    meeting.shareAppContentToStage(handler, appContentUrl);
  };

  const getPairedMeetingRoomInfo = (): void => {
    setGetPairedMeetingRoomInfoRes('getPairedMeetingRoomInfo' + noHubSdkMsg);
    const callback = (sdkError: SdkError, meetingRoomInfo: meetingRoom.MeetingRoomInfo): void => {
      if (sdkError) {
        setGetPairedMeetingRoomInfoRes(JSON.stringify(sdkError));
      } else {
        setGetPairedMeetingRoomInfoRes(JSON.stringify(meetingRoomInfo));
      }
    };
    meetingRoom.getPairedMeetingRoomInfo(callback);
  };

  const sendCommandToPairedMeetingRoom = (commandName: string): void => {
    setSendCommandToPairedMeetingRoomRes('sendCommandToPairedMeetingRoom' + noHubSdkMsg);
    const callback = (sdkError: SdkError): void => {
      sdkError
        ? setSendCommandToPairedMeetingRoomRes(JSON.stringify(sdkError))
        : setSendCommandToPairedMeetingRoomRes('Success');
    };
    meetingRoom.sendCommandToPairedMeetingRoom(commandName, callback);
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
    </>
  );
};

export default MeetingAPIs;
