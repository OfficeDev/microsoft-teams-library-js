import { monetization, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const MonetizationAPIs = (): ReactElement => {
  const [openPurchaseExperienceRes, setOpenPurchaseExperienceRes] = React.useState('');

  const openPurchaseExperience = (): void => {
    const callback = (error: SdkError | null): void => {
      if (error) {
        setOpenPurchaseExperienceRes(JSON.stringify(error));
      } else {
        setOpenPurchaseExperienceRes('Success');
      }
    };
    setOpenPurchaseExperienceRes('monetization.openPurchaseExperience()' + noHubSdkMsg);
    monetization.openPurchaseExperience(callback);
  };

  return (
    <>
      <h1>monetization</h1>
      <BoxAndButton
        handleClick={openPurchaseExperience}
        output={openPurchaseExperienceRes}
        hasInput={false}
        title="Open purchase experience"
        name="monetization_openPurchaseExperience"
      />
    </>
  );
};

export default MonetizationAPIs;
