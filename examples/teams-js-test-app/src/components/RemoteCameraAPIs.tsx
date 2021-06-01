import React, { ReactElement } from 'react';
import { remoteCamera, SdkError } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { generateJsonParseErrorMsg, noHubSdkMsg, generateRegistrationMsg } from '../App';

const RemoteCameraAPIs = (): ReactElement => {
  const [getCapableParticipantsRes, setGetCapableParticipantsRes] = React.useState('');
  const [requestControlRes, setRequestControlRes] = React.useState('');
  const [sendControlCommandRes, setSendControlCommandRes] = React.useState('');
  const [terminateSessionRes, setTerminateSessionRes] = React.useState('');
  const [
    registerOnCapableParticipantsChangeHandlerRes,
    setRegisterOnCapableParticipantsChangeHandlerRes,
  ] = React.useState('');
  const [registerOnErrorHandlerRes, setRegisterOnErrorHandlerRes] = React.useState('');
  const [registerOnDeviceStateChangeHandlerRes, setRegisterOnDeviceStateChangeHandlerRes] = React.useState('');
  const [registerOnSessionStatusChangeHandlerRes, setRegisterOnSessionStatusChangeHandlerRes] = React.useState('');

  const getControlCommandFromInput = (input: string): remoteCamera.ControlCommand | null => {
    switch (input) {
      case 'Reset':
        return remoteCamera.ControlCommand.Reset;
      case 'ZoomIn':
        return remoteCamera.ControlCommand.ZoomIn;
      case 'ZoomOut':
        return remoteCamera.ControlCommand.ZoomOut;
      case 'PanLeft':
        return remoteCamera.ControlCommand.PanLeft;
      case 'PanRight':
        return remoteCamera.ControlCommand.PanRight;
      case 'TiltUp':
        return remoteCamera.ControlCommand.TiltUp;
      case 'TiltDown':
        return remoteCamera.ControlCommand.TiltDown;
    }
    return null;
  };

  const getCapableParticipants = (): void => {
    setGetCapableParticipantsRes('remoteCamera.getCapableParticipants' + noHubSdkMsg);
    const callback = (error: SdkError | null, participants: remoteCamera.Participant[] | null): void => {
      if (error) {
        setGetCapableParticipantsRes('Error: ' + JSON.stringify(error));
      } else {
        setGetCapableParticipantsRes(JSON.stringify(participants));
      }
    };
    remoteCamera.getCapableParticipants(callback);
  };

  const requestControl = (participantInput: string): void => {
    setRequestControlRes('remoteCamera.requestControl' + noHubSdkMsg);
    try {
      const participant: remoteCamera.Participant = JSON.parse(participantInput);
      const callback = (error: SdkError | null, requestResponse: boolean | null): void => {
        if (error) {
          setGetCapableParticipantsRes('Error: ' + JSON.stringify(error));
        } else {
          setGetCapableParticipantsRes(JSON.stringify(requestResponse));
        }
      };
      remoteCamera.requestControl(participant, callback);
    } catch (error) {
      if (error instanceof SyntaxError) {
        const exampleInput: remoteCamera.Participant = { id: 'idStr' };
        setRequestControlRes(generateJsonParseErrorMsg(exampleInput));
      } else {
        setRequestControlRes(error.message);
      }
    }
  };

  const sendControlCommand = (controlCommandInput: string): void => {
    setSendControlCommandRes('remoteCamera.sendControl' + noHubSdkMsg);
    const controlCommand: remoteCamera.ControlCommand | null = getControlCommandFromInput(controlCommandInput);
    if (!controlCommand) {
      setSendControlCommandRes(
        "Could not find such a ControlCommand. Please ensure to give us a ControlCommand. For example, you can put in 'Reset', without the quotes.",
      );
      return;
    }
    const callback = (error: SdkError | null): void => {
      if (error) {
        setSendControlCommandRes('Error: ' + JSON.stringify(error));
      } else {
        setSendControlCommandRes('Success');
      }
    };
    remoteCamera.sendControlCommand(controlCommand, callback);
  };

  const terminateSession = (): void => {
    setTerminateSessionRes('remoteCamera.terminateSession' + noHubSdkMsg);
    const callback = (error: SdkError | null): void => {
      if (error) {
        setTerminateSessionRes('Error: ' + JSON.stringify(error));
      } else {
        setTerminateSessionRes('Success');
      }
    };
    remoteCamera.terminateSession(callback);
  };

  const registerOnCapableParticipantsChangeHandler = (): void => {
    setRegisterOnCapableParticipantsChangeHandlerRes(
      generateRegistrationMsg('a change in participants with constrollable-cameras occurs'),
    );
    const handler = (participantChange: remoteCamera.Participant[]): void => {
      setRegisterOnCapableParticipantsChangeHandlerRes('participantChange: ' + JSON.stringify(participantChange));
    };
    remoteCamera.registerOnCapableParticipantsChangeHandler(handler);
  };

  const registerOnErrorHandler = (): void => {
    setRegisterOnErrorHandlerRes(generateRegistrationMsg('an error from the camera handler occurs'));
    const handler = (error: remoteCamera.ErrorReason): void => {
      setRegisterOnErrorHandlerRes(JSON.stringify(error));
    };
    remoteCamera.registerOnErrorHandler(handler);
  };

  const registerOnDeviceStateChangeHandler = (): void => {
    setRegisterOnDeviceStateChangeHandlerRes(generateRegistrationMsg('the controlled device changes state'));
    const handler = (deviceStateChange: remoteCamera.DeviceState): void => {
      setRegisterOnDeviceStateChangeHandlerRes(JSON.stringify(deviceStateChange));
    };
    remoteCamera.registerOnDeviceStateChangeHandler(handler);
  };

  const registerOnSessionStatusChangeHandler = (): void => {
    setRegisterOnSessionStatusChangeHandlerRes(generateRegistrationMsg('the current status changes'));
    const handler = (sessionStatusChange: remoteCamera.SessionStatus): void => {
      setRegisterOnDeviceStateChangeHandlerRes(JSON.stringify(sessionStatusChange));
    };
    remoteCamera.registerOnSessionStatusChangeHandler(handler);
  };

  return (
    <>
      <h1>remoteCamera</h1>
      <BoxAndButton
        handleClick={getCapableParticipants}
        output={getCapableParticipantsRes}
        hasInput={false}
        title="Get Capable Participants"
        name="getCapableParticipants"
      />
      <BoxAndButton
        handleClickWithInput={requestControl}
        output={requestControlRes}
        hasInput={true}
        title="Request Control"
        name="requestControl"
      />
      <BoxAndButton
        handleClickWithInput={sendControlCommand}
        output={sendControlCommandRes}
        hasInput={true}
        title="Send Control Command"
        name="sendControlCommand"
      />
      <BoxAndButton
        handleClick={terminateSession}
        output={terminateSessionRes}
        hasInput={false}
        title="Terminate Session"
        name="terminateSession"
      />
      <BoxAndButton
        handleClick={registerOnCapableParticipantsChangeHandler}
        output={registerOnCapableParticipantsChangeHandlerRes}
        hasInput={false}
        title="Register On Capable Participants Change Handler"
        name="registerOnCapableParticipantsChangeHandler"
      />
      <BoxAndButton
        handleClick={registerOnErrorHandler}
        output={registerOnErrorHandlerRes}
        hasInput={false}
        title="Register On Error Handler"
        name="registerOnErrorHandler"
      />
      <BoxAndButton
        handleClick={registerOnDeviceStateChangeHandler}
        output={registerOnDeviceStateChangeHandlerRes}
        hasInput={false}
        title="Register On Device State Change Handler"
        name="registerOnDeviceStateChangeHandler"
      />
      <BoxAndButton
        handleClick={registerOnSessionStatusChangeHandler}
        output={registerOnSessionStatusChangeHandlerRes}
        hasInput={false}
        title="Register On Session Status Change Handler"
        name="registerOnSessionStatusChangeHandler"
      />
    </>
  );
};

export default RemoteCameraAPIs;
