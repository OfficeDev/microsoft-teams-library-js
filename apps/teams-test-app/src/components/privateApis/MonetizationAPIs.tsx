import { monetization, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

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
      validateInput: (planInfo) => {
        if (!planInfo) {
          return; //This API allow for the input not to be provided
        }
        if (!planInfo.planId || !planInfo.term) {
          throw new Error('planId and term are required on input, if provided');
        }
      },
      submit: {
        withPromise: async (planInfo) => {
          await monetization.openPurchaseExperience(planInfo);
          return 'monetization.openPurchaseExperience()' + noHostSdkMsg;
        },
        withCallback: (planInfo, setResult) => {
          const callback = (error: SdkError | null): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult('Success');
            }
          };
          monetization.openPurchaseExperience(callback, planInfo);
        },
      },
    },
  });

const MonetizationAPIs = (): ReactElement => (
  <ModuleWrapper title="Monetization">
    <OpenPurchaseExperience />
    <CheckMonetizationCapability />
  </ModuleWrapper>
);

export default MonetizationAPIs;
