import { remoteCamera, SdkError } from '@microsoft/teams-js';
import React from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const RemoteCameraCapabilityCheck = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkRemoteCameraCapability',
    title: 'Check Remote Camera Capability',
    onClick: async () => `Remote Camera module ${remoteCamera.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetCapableParticipants = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getCapableParticipants',
    title: 'Get Capable Participants',
    onClick: () => {
      return new Promise<string>((res, rej) => {
        const callback = (error: SdkError | null, participants: remoteCamera.Participant[] | null): void => {
          if (error) {
            rej('Error: ' + JSON.stringify(error));
          } else {
            res(JSON.stringify(participants));
          }
        };

        remoteCamera.getCapableParticipants(callback);
      });
    },
  });

const RequestControl = (): React.ReactElement =>
  ApiWithTextInput<remoteCamera.Participant>({
    name: 'requestControl',
    title: 'Request Control',
    onClick: {
      validateInput: (input) => {
        if (!input.id) {
          throw new Error('id is required.');
        }
      },
      submit: (input) => {
        return new Promise<string>((res, rej) => {
          const callback = (error: SdkError | null, requestResponse: boolean | null): void => {
            if (error) {
              rej('Error: ' + JSON.stringify(error));
            } else {
              res(JSON.stringify(requestResponse));
            }
          };

          remoteCamera.requestControl(input, callback);
        });
      },
    },
  });

const SendControlCommand = (): React.ReactElement =>
  ApiWithTextInput<remoteCamera.ControlCommand>({
    name: 'sendControlCommand',
    title: 'Send Control Command',
    onClick: {
      validateInput: (input) => {
        const controlCommandValues = Object.values(remoteCamera.ControlCommand);
        if (!input || typeof input !== 'string' || !controlCommandValues.includes(input)) {
          throw new Error(
            'input has to be a string with one of following values: ' + JSON.stringify(controlCommandValues),
          );
        }
      },
      submit: (input) => {
        return new Promise<string>((res, rej) => {
          const callback = (error: SdkError | null): void => {
            if (error) {
              rej('Error: ' + JSON.stringify(error));
            } else {
              res('Success');
            }
          };

          remoteCamera.sendControlCommand(input, callback);
        });
      },
    },
  });

const TerminateSession = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'terminateSession',
    title: 'Terminate Session',
    onClick: () => {
      return new Promise<string>((res, rej) => {
        const callback = (error: SdkError | null): void => {
          if (error) {
            rej('Error: ' + JSON.stringify(error));
          } else {
            res('Success');
          }
        };
        remoteCamera.terminateSession(callback);
      });
    },
  });

const RegisterOnCapableParticipantsChangeHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerOnCapableParticipantsChangeHandler',
    title: 'Register On Capable Participants Change Handler',
    onClick: async (setResult) => {
      const handler = (participantChange: remoteCamera.Participant[]): void => {
        setResult('participantChange: ' + JSON.stringify(participantChange));
      };

      remoteCamera.registerOnCapableParticipantsChangeHandler(handler);
      return generateRegistrationMsg('a change in participants with constrollable-cameras occurs');
    },
  });

const RegisterOnErrorHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerOnErrorHandler',
    title: 'Register On Error Handler',
    onClick: async (setResult) => {
      const handler = (error: remoteCamera.ErrorReason): void => {
        setResult(JSON.stringify(error));
      };

      remoteCamera.registerOnErrorHandler(handler);
      return generateRegistrationMsg('an error from the camera handler occurs');
    },
  });

const RegisterOnDeviceStateChangeHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerOnDeviceStateChangeHandler',
    title: 'Register On Device State Change Handler',
    onClick: async (setResult) => {
      const handler = (deviceStateChange: remoteCamera.DeviceState): void => {
        setResult(JSON.stringify(deviceStateChange));
      };

      remoteCamera.registerOnDeviceStateChangeHandler(handler);
      return generateRegistrationMsg('the controlled device changes state');
    },
  });

const RegisterOnSessionStatusChangeHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerOnSessionStatusChangeHandler',
    title: 'Register On Session Status Change Handler',
    onClick: async (setResult) => {
      const handler = (sessionStatusChange: remoteCamera.SessionStatus): void => {
        setResult(JSON.stringify(sessionStatusChange));
      };

      remoteCamera.registerOnSessionStatusChangeHandler(handler);
      return generateRegistrationMsg('the current status changes');
    },
  });

const RemoteCameraAPIs = (): React.ReactElement => (
  <ModuleWrapper title="RemoteCamera">
    <RemoteCameraCapabilityCheck />
    <GetCapableParticipants />
    <RequestControl />
    <SendControlCommand />
    <TerminateSession />
    <RegisterOnCapableParticipantsChangeHandler />
    <RegisterOnErrorHandler />
    <RegisterOnDeviceStateChangeHandler />
    <RegisterOnSessionStatusChangeHandler />
  </ModuleWrapper>
);

export default RemoteCameraAPIs;
