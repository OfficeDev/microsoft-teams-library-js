import { monetization, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithoutInput } from '../utils';

const CheckMonetizationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityMonetization',
    title: 'Check Monetization Capability',
    onClick: async () => `Monetization module ${monetization.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenPurchaseExperience = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'monetization_openPurchaseExperience',
    title: 'Open Purchase Experience',
    onClick: async setResult => {
      const callback = (error: SdkError | null): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult('Success');
        }
      };

      monetization.openPurchaseExperience(callback);
      return 'monetization.openPurchaseExperience()' + noHostSdkMsg;
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
