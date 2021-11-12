import { meetingRoom } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg, noHostSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const MeetingRoomAPIs = (): ReactElement => {
  const [getPairedMeetingRoomInfoRes, setGetPairedMeetingRoomInfoRes] = React.useState('');
  const [sendCommandToPairedMeetingRoomRes, setSendCommandToPairedMeetingRoomRes] = React.useState('');
  const [
    registerMeetingRoomCapabilitiesUpdateHandlerRes,
    setRegisterMeetingRoomCapabilitiesUpdateHandlerRes,
  ] = React.useState('');
  const [registerMeetingRoomStatesUpdateHandlerRes, setRegisterMeetingRoomStatesUpdateHandlerRes] = React.useState('');

  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const getPairedMeetingRoomInfo = (): void => {
    setGetPairedMeetingRoomInfoRes('meetingRoom.getPairedMeetingRoomInfo' + noHostSdkMsg);
    meetingRoom
      .getPairedMeetingRoomInfo()
      .then(meetingRoomInfo => setGetPairedMeetingRoomInfoRes(JSON.stringify(meetingRoomInfo)))
      .catch(error => setGetPairedMeetingRoomInfoRes('Error code: ' + error));
  };

  const sendCommandToPairedMeetingRoom = (commandName: string): void => {
    setSendCommandToPairedMeetingRoomRes('meetingRoom.sendCommandToPairedMeetingRoom' + noHostSdkMsg);
    meetingRoom
      .sendCommandToPairedMeetingRoom(commandName)
      .then(() => setSendCommandToPairedMeetingRoomRes('sendCommandToPairedMeetingRoom have been called'))
      .catch(error => setSendCommandToPairedMeetingRoomRes('Error code: ' + error));
  };
  const registerMeetingRoomCapabilitiesUpdateHandler = (): void => {
    setRegisterMeetingRoomCapabilitiesUpdateHandlerRes(
      generateRegistrationMsg('it is invoked when the live stream state changes'),
    );
    const handler = (meetingRoomCapability: meetingRoom.MeetingRoomCapability): void => {
      setRegisterMeetingRoomCapabilitiesUpdateHandlerRes(
        `Capabilities of meeting room update ${JSON.stringify(meetingRoomCapability)}`,
      );
    };
    meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(handler);
  };
  const registerMeetingRoomStatesUpdateHandler = (): void => {
    setRegisterMeetingRoomStatesUpdateHandlerRes(
      generateRegistrationMsg('it is invoked when the live stream state changes'),
    );
    const handler = (meetingRoomState: meetingRoom.MeetingRoomState): void => {
      setRegisterMeetingRoomStatesUpdateHandlerRes(`States of meeting room update ${JSON.stringify(meetingRoomState)}`);
    };
    meetingRoom.registerMeetingRoomStatesUpdateHandler(handler);
  };

  const checkMeetingRoomCapability = (): void => {
    if (meetingRoom.isSupported()) {
      setCapabilityCheckRes('MeetingRoom is supported');
    } else {
      setCapabilityCheckRes('MeetingRoom is not supported');
    }
  };

  return (
    <>
      <h1>meetingRoom</h1>
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
        title="Send Command To PairedMeeting Room"
        name="sendCommandToPairedMeetingRoom"
      />
      <BoxAndButton
        handleClick={registerMeetingRoomCapabilitiesUpdateHandler}
        output={registerMeetingRoomCapabilitiesUpdateHandlerRes}
        hasInput={false}
        title="Register MeetingRoom Capabilities Update Handler"
        name="registerMeetingRoomCapabilitiesUpdateHandler"
      />
      <BoxAndButton
        handleClick={registerMeetingRoomStatesUpdateHandler}
        output={registerMeetingRoomStatesUpdateHandlerRes}
        hasInput={false}
        title="Register MeetingRoom States UpdateHandler"
        name="registerMeetingRoomStatesUpdateHandler"
      />
      <BoxAndButton
        handleClick={checkMeetingRoomCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check MeetingRoom Capability"
        name="checkMeetingRoomCapability"
      />
    </>
  );
};

export default MeetingRoomAPIs;
