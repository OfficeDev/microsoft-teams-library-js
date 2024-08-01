import { copilot } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CopilotAPIs = (): ReactElement => {
  const CheckCopilotEligibilityCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'CheckCopilotEligibilityCapability',
      title: 'Check if Copilot.Eligibility is supported',
      onClick: async () => `Copilot.Eligibility ${copilot.eligibility.isSupported() ? 'is' : 'is not'} supported`,
    });

  const GetEligibilityInfo = (): ReactElement =>
    ApiWithoutInput({
      name: 'GetEligibilityInfo',
      title: 'Get the app Eligibility Information',
      onClick: async () => `EligibilityInfo: ${copilot.eligibility.getEligibilityInfo()}`,
    });

  return (
    <ModuleWrapper title="Copilot.Eligibility">
      <CheckCopilotEligibilityCapability />
      <GetEligibilityInfo />
    </ModuleWrapper>
  );
};

export default CopilotAPIs;
