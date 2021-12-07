import { monetization, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckMonetizationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityMonetization',
    title: 'Check Monetization Capability',
    onClick: async () => `Monetization module ${monetization.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenPurchaseExperience = (): React.ReactElement =>
  ApiWithTextInput<monetization.PlanInfo | undefined>({
    name: 'monetization_openPurchaseExperience',
    title: 'Open Purchase Experience',
    onClick: {
      validateInput: planInfo => {
        if (!planInfo) {
          return; //This API allow for the input not to be provided
        }
        if (typeof planInfo.planId !== 'string') {
          throw new Error('planId has to be a string');
        }
        if (typeof planInfo.term !== 'string') {
          throw new Error('term has to be a string');
        }
      },
      submit: async planInfo => {
        await monetization.openPurchaseExperience(planInfo);
        return 'monetization.openPurchaseExperience()' + noHostSdkMsg;
      },
    },
  });

const MonetizationAPIs = (): ReactElement => (
  <>
    <h1>monetization</h1>
    <OpenPurchaseExperience />
    <CheckMonetizationCapability />
  </>
);

export default MonetizationAPIs;
