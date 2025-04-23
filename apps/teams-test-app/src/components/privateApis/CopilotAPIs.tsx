import { copilot, UUID } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

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
    ApiWithTextInput<boolean>({
      name: 'getEligibilityInfo',
      title: 'Get the app Eligibility Information',
      onClick: async (input: boolean) => {
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
    </>
  );
};

export default CopilotAPIs;
