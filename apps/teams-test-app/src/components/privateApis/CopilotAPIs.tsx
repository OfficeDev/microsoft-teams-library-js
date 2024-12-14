import { copilot } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';
import { UUID } from 'crypto';

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

  const SendCustomTelemetryData = (): ReactElement =>
    ApiWithTextInput<{
      stageNameIdentifier: UUID;
      timestamp: number;
    }>({
      name: 'sendCustomTelemetryData',
      title: 'sendCustomTelemetryData',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validateInput: (_input) => {},
        submit: async (input) => {
          const result = await copilot.customTelemetry.sendCustomTelemetryData(input.name, input.timestamp);
          return JSON.stringify(result);
        },
      },
      defaultInput: JSON.stringify({ name: copilot.Stage.STAGE_E, timestamp: Date.now() }),
    });

  return (
    <>
      <ModuleWrapper title="Copilot.Eligibility">
        <CheckCopilotEligibilityCapability />
        <GetEligibilityInfo />
      </ModuleWrapper>
      <ModuleWrapper title="Copilot.CustomTelemetry">
        <SendCustomTelemetryData />
      </ModuleWrapper>
    </>
  );
};

export default CopilotAPIs;
