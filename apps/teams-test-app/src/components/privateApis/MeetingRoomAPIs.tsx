import { meetingRoom } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckMeetingRoomCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMeetingRoomCapability',
    title: 'Check MeetingRoom Capability',
    onClick: async () => `MeetingRoom ${meetingRoom.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetPairedMeetingRoomInfo = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getPairedMeetingRoomInfo',
    title: 'Get Paired MeetingRoom Info',
    onClick: async () => {
      const result = await meetingRoom.getPairedMeetingRoomInfo();
      return JSON.stringify(result);
    },
  });

const SendCommandToPairedMeetingRoom = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'sendCommandToPairedMeetingRoom',
    title: 'Send Command To PairedMeeting Room',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async (input) => {
        await meetingRoom.sendCommandToPairedMeetingRoom(input);
        return 'sendCommandToPairedMeetingRoom have been called';
      },
    },
  });

const RegisterMeetingRoomCapabilitiesUpdateHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerMeetingRoomCapabilitiesUpdateHandler',
    title: 'Register MeetingRoom Capabilities Update Handler',
    onClick: async (setResult) => {
      const handler = (meetingRoomCapability: meetingRoom.MeetingRoomCapability): void => {
        setResult(`Capabilities of meeting room update ${JSON.stringify(meetingRoomCapability)}`);
      };
      meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(handler);

      return generateRegistrationMsg('the meeting room capabilities update');
    },
  });

const RegisterMeetingRoomStatesUpdateHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerMeetingRoomStatesUpdateHandler',
    title: 'Register MeetingRoom States UpdateHandler',
    onClick: async (setResult) => {
      const handler = (meetingRoomState: meetingRoom.MeetingRoomState): void => {
        setResult(`States of meeting room update ${JSON.stringify(meetingRoomState)}`);
      };
      meetingRoom.registerMeetingRoomStatesUpdateHandler(handler);

      return generateRegistrationMsg('the meeting room states update');
    },
  });

const MeetingRoomAPIs = (): React.ReactElement => (
  <ModuleWrapper title="MeetingRoom">
    <GetPairedMeetingRoomInfo />
    <SendCommandToPairedMeetingRoom />
    <RegisterMeetingRoomCapabilitiesUpdateHandler />
    <RegisterMeetingRoomStatesUpdateHandler />
    <CheckMeetingRoomCapability />
  </ModuleWrapper>
);

export default MeetingRoomAPIs;
