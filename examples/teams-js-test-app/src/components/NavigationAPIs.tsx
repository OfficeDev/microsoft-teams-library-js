import React, { ReactElement } from 'react';
import BoxAndButton from './BoxAndButton';
import CheckboxAndButton from './CheckboxAndButton';
import { noHubSdkMsg } from '../App';

const NavigationAPIs = (): ReactElement => {
  const [navigateCrossDomainRes, setNavigateCrossDomainRes] = React.useState('');
  const [returnFocusRes, setReturnFocusRes] = React.useState('');

  const navigateCrossDomain = (url: string): void => {
    setNavigateCrossDomainRes('navigateCrossDomain()' + noHubSdkMsg);
    let inputUrl = JSON.stringify(url);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setNavigateCrossDomainRes(reason);
      } else {
        setNavigateCrossDomainRes('Completed');
      }
    };
    teamsjs.navigateCrossDomain(inputUrl, onComplete);
  };

  const returnFocus = (navigateForward: string): void => {
    setReturnFocusRes('Current navigateForward state is ' + navigateForward);
    teamsjs.returnFocus(navigateForward === 'true');
  };

  return (
    <>
      <BoxAndButton
        handleClick={navigateCrossDomain}
        output={navigateCrossDomainRes}
        hasInput={true}
        title="Navigate Cross Domain"
        name="navigateCrossDomain"
      />
      <CheckboxAndButton
        handleClick={returnFocus}
        output={returnFocusRes}
        hasInput={false}
        title="Return Focus"
        name="returnFocus"
        hasTitle={true}
        checkBoxTitle="navigateForward:"
      />
    </>
  );
};

export default NavigationAPIs;
