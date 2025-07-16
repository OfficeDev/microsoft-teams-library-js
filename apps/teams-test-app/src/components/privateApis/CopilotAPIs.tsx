import { copilot, sidePanelInterfaces, UUID } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from '../utils';
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
    ApiWithCheckboxInput({
      name: 'getEligibilityInfo',
      title: 'Get the app Eligibility Information',
      label: 'forceRefresh',
      onClick: async (input) => {
        const result = await copilot.eligibility.getEligibilityInfo(input);
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
  interface CustomTelemetryInputType {
    stageNameIdentifier: string;
    timestamp?: number;
  }
  const SendCustomTelemetryData = (): ReactElement =>
    ApiWithTextInput<CustomTelemetryInputType>({
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
    ApiWithTextInput<sidePanelInterfaces.ContentRequest>({
      name: 'getContent',
      title: 'getContent',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validateInput: (_input) => {},
        submit: async (input) => {
          try {
            const result = input ? await copilot.sidePanel.getContent(input) : await copilot.sidePanel.getContent();
            return JSON.stringify(result);
          } catch (error) {
            return `Error: ${error}`;
          }
        },
      },
      defaultInput: JSON.stringify({
        localEndpointInfo: 'read',
      }),
    });

  const PreCheckUserConsent = (): ReactElement =>
    ApiWithoutInput({
      name: 'preCheckUserConsent',
      title: 'Get User Consent',
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
        const handler = (data: sidePanelInterfaces.Content): void => {
          const res = `UserAction Content Select called with data: ${JSON.stringify(data)}`;
          setResult(res);
        };
        copilot.sidePanel.registerUserActionContentSelect(handler);
        return generateRegistrationMsg('then the content is selected by the user');
      },
    });

  const CheckCopilotViewCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCopilotViewCapability',
      title: 'Check if Copilot.View is supported',
      onClick: async () => `Copilot.View module ${copilot.view.isSupported() ? 'is' : 'is not'} supported`,
    });

  const CloseSidePanel = (): ReactElement =>
    ApiWithoutInput({
      name: 'closeSidePanel',
      title: 'Close Side Panel',
      onClick: async () => {
        try {
          await copilot.view.closeSidePanel();
          return 'copilot.view.closeSidePanel() was called';
        } catch (error) {
          return `Error: ${error}`;
        }
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
        <GetContent />
        <PreCheckUserConsent />
      </ModuleWrapper>
      <ModuleWrapper title="Copilot.View">
        <CheckCopilotViewCapability />
        <CloseSidePanel />
      </ModuleWrapper>
    </>
  );
};

export default CopilotAPIs;
