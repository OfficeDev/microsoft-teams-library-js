import { copilot, UUID } from '@microsoft/teams-js';
import {
  Content,
  PreCheckContextResponse,
} from '@microsoft/teams-js/dist/esm/packages/teams-js/dts/private/copilot/sidePanelInterfaces';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CopilotAPIs = (): ReactElement => {
  const CheckCopilotEligibilityCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCopilotEligibilityCapability',
      title: 'Check if Copilot.Eligibility is supported',
      onClick: async () =>
        `Copilot.Eligibility module ${copilot.eligibility.isSupported() ? 'is' : 'is not'} supported`,
    });

  const GetEligibilityInfo = (): ReactElement =>
    ApiWithoutInput({
      name: 'getEligibilityInfo',
      title: 'Get the app Eligibility Information',
      onClick: async () => {
        const result = await copilot.eligibility.getEligibilityInfo();
        return JSON.stringify(result);
      },
    });

  const CheckCopilotCustomTelemetryCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCopilotCustomTelemetryCapability',
      title: 'Check if Copilot.CustomTelemetry is supported',
      onClick: async () =>
        `Copilot.CustomTelemetry module ${copilot.customTelemetry.isSupported() ? 'is' : 'is not'} supported`,
    });
  interface InputType {
    stageNameIdentifier: string;
    timestamp?: number;
  }
  const SendCustomTelemetryData = (): ReactElement =>
    ApiWithTextInput<InputType>({
      name: 'sendCustomTelemetryData',
      title: 'sendCustomTelemetryData',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validateInput: (_input) => {},
        submit: async (input) => {
          try {
            await copilot.customTelemetry.sendCustomTelemetryData(new UUID(input.stageNameIdentifier), input.timestamp);
            return 'copilot.customTelemetry.sendCustomTelemetryData() was called';
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        stageNameIdentifier: '805a4340-d5e0-4587-8f04-0ae88219699f',
        timestamp: Date.now(),
      }),
    });

  const CheckCopilotSidePanelCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCopilotSidePanelCapability',
      title: 'Check if Copilot.SidePanel is supported',
      onClick: async () => `Copilot.SidePanel module ${copilot.sidePanel.isSupported() ? 'is' : 'is not'} supported`,
    });

  const GetContent = (): ReactElement =>
    ApiWithoutInput({
      name: 'getContent',
      title: 'Get the hub content for copilot',
      onClick: async () => {
        const result = await copilot.sidePanel.getContent();
        return JSON.stringify(result);
      },
    });

  const PreCheckUserConsent = (): ReactElement =>
    ApiWithoutInput({
      name: 'preCheckUserConsent',
      title: 'Get the user consent for the copilot to see the context',
      onClick: async () => {
        const result = await copilot.sidePanel.preCheckUserConsent();
        return JSON.stringify(result);
      },
    });

  const RegisterUserActionContentSelect = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'registerUserActionContentSelect',
      title: 'Register UserAction Content Select',
      onClick: async (setResult) => {
        const handler = (data: Content): void => {
          const res = `UserAction Content Select called with data: ${JSON.stringify(data)}`;
          setResult(res);
        };
        copilot.sidePanel.registerUserActionContentSelect(handler);
        return generateRegistrationMsg('then the content is selected by the user');
      },
    });

  const RegisterUserConsent = (): React.ReactElement =>
    ApiWithoutInput({
      name: 'registerUserConsent',
      title: 'Register User Consent',
      onClick: async (setResult) => {
        const handler = (data: PreCheckContextResponse): void => {
          if (data.error_code) {
            setResult(`Error: ${data.error_code} - ${data.status}`);
            return;
          }
          setResult(data.user_consent === 'accepted' ? 'User consent accepted' : 'User consent not accepted');
        };
        copilot.sidePanel.registerUserConsent(handler);
        return generateRegistrationMsg('then the user changes their consent in the hub');
      },
    });

  return (
    <>
      <ModuleWrapper title="Copilot.Eligibility">
        <CheckCopilotEligibilityCapability />
        <GetEligibilityInfo />
      </ModuleWrapper>
      <ModuleWrapper title="Copilot.CustomTelemetry">
        <CheckCopilotCustomTelemetryCapability />
        <SendCustomTelemetryData />
      </ModuleWrapper>
      <ModuleWrapper title="Copilot.SidePanel">
        <CheckCopilotSidePanelCapability />
        <RegisterUserActionContentSelect />
        <RegisterUserConsent />
        <GetContent />
        <PreCheckUserConsent />
      </ModuleWrapper>
    </>
  );
};

export default CopilotAPIs;
