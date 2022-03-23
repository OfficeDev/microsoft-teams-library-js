import { monetization, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithTextInput } from '../utils';
import { SupportButton } from '../utils/SupportButton/SupportButton';

const CheckMonetizationCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkCapabilityMonetization',
    module: 'Monetization',
    isSupported: monetization.isSupported(),
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
        if (!planInfo.planId || !planInfo.term) {
          throw new Error('planId and term are required on input, if provided');
        }
      },
      submit: {
        withPromise: async planInfo => {
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
  <>
    <h1>monetization</h1>
    <CheckMonetizationCapability />
    <OpenPurchaseExperience />
  </>
);

export default MonetizationAPIs;
