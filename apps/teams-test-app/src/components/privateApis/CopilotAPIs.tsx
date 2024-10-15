import { copilot } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from '../utils';
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
      //onClick: async () => `${JSON.stringify(copilot.eligibility.getEligibilityInfo())}`,
      onClick: async () => {
        const result = await copilot.eligibility.getEligibilityInfo();
        return JSON.stringify(result);
      },
    });

  return (
    <ModuleWrapper title="Copilot.Eligibility">
      <CheckCopilotEligibilityCapability />
      <GetEligibilityInfo />
    </ModuleWrapper>
  );
};

export default CopilotAPIs;
