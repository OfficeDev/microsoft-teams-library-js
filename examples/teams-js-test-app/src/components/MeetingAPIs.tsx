import React, { ReactElement } from 'react';
import { meeting } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const MeetingAPIs = (): ReactElement => {
  const [getIncomingClientAudioStateRes, setGetIncomingClientAudioStateRes] = React.useState('');
  const [toggleIncomingClientAudioRes, setToggleIncomingClientAudioRes] = React.useState('');
  const [getMeetingDetailsRes, setGetMeetingDetailsRes] = React.useState('');
  const [getAuthenticationTokenRes, setGetAuthenticationTokenRes] = React.useState('');
  const [checkMeetingCapabilityRes, setCheckMeetingCapabilityRes] = React.useState('');

  const getIncomingClientAudioState = (): void => {
    setGetIncomingClientAudioStateRes('getIncomingClientAudioState()' + noHubSdkMsg);
    meeting.getIncomingClientAudioState((err: teamsjs.SdkError | null, result: boolean | null): void => {
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
    meeting.toggleIncomingClientAudio((err: teamsjs.SdkError | null, result: boolean | null): void => {
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
    meeting.getMeetingDetails((err: teamsjs.SdkError | null, meetingDetails: meeting.IMeetingDetails | null): void => {
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
    meeting.getAuthenticationTokenForAnonymousUser((err: teamsjs.SdkError | null, authToken: string | null): void => {
      if (err) {
        setGetAuthenticationTokenRes(err.errorCode.toString() + ' ' + err.message);
        return;
      }
      if (authToken) {
        setGetAuthenticationTokenRes(authToken);
      }
    });
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
