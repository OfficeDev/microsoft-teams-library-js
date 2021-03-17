import React, { ReactElement } from 'react';
import BoxAndButton from './BoxAndButton';
import CheckboxAndButton from './CheckboxAndButton';
import { noHubSdkMsg } from '../App';
import {
  navigateToTab,
  navigateCrossDomain,
  navigateBack,
  returnFocus,
  isPageCapabilitySupported,
} from '@microsoft/teamsjs-app-sdk';

const NavigationAPIs = (): ReactElement => {
  const [navigateCrossDomainRes, setNavigateCrossDomainRes] = React.useState('');
  const [returnFocusRes, setReturnFocusRes] = React.useState('');
  const [navigateToTabRes, setNavigateToTabRes] = React.useState('');
  const [navigateBackRes, setNavigateBackRes] = React.useState('');
  const [checkPageCapabilityRes, setCheckPageCapabilityRes] = React.useState('');

  const navigateCrossDomainFunc = (url: string): void => {
    setNavigateCrossDomainRes('navigateCrossDomain()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setNavigateCrossDomainRes(reason);
      } else {
        setNavigateCrossDomainRes('Completed');
      }
    };
    navigateCrossDomain(url, onComplete);
  };

  const navigateToTabFunc = (inputParams: string): void => {
    setNavigateToTabRes('navigateToTab()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setNavigateToTabRes(reason);
      } else {
        setNavigateToTabRes('Completed');
      }
    };
    navigateToTab(JSON.parse(inputParams), onComplete);
  };

  const navigateBackFunc = (): void => {
    setNavigateBackRes('navigateBack()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setNavigateBackRes(reason);
      } else {
        setNavigateBackRes('Completed');
      }
    };
    navigateBack(onComplete);
  };

  const returnFocusFunc = (navigateForward: string): void => {
    setReturnFocusRes('Current navigateForward state is ' + navigateForward);
    returnFocus(navigateForward === 'true');
  };

  const pageCapabilityCheck = (): void => {
    if (isPageCapabilitySupported()) {
      setCheckPageCapabilityRes('Page module is supported');
    } else {
      setCheckPageCapabilityRes('Page module is not supported');
    }
  };
  return (
    <>
      <BoxAndButton
        handleClickWithInput={navigateCrossDomainFunc}
        output={navigateCrossDomainRes}
        hasInput={true}
        title="Navigate Cross Domain"
        name="navigateCrossDomain"
      />
      <CheckboxAndButton
        handleClickWithInput={returnFocusFunc}
        output={returnFocusRes}
        hasInput={false}
        title="Return Focus"
        name="returnFocus"
        hasTitle={true}
        checkBoxTitle="navigateForward:"
      />
      <BoxAndButton
        handleClickWithInput={navigateToTabFunc}
        output={navigateToTabRes}
        hasInput={true}
        title="Navigate To Tab"
        name="navigateToTab"
      />
      <BoxAndButton
        handleClickWithInput={navigateBackFunc}
        output={navigateBackRes}
        hasInput={false}
        title="Navigate Back"
        name="navigateBack"
      />
      <BoxAndButton
        handleClick={pageCapabilityCheck}
        output={checkPageCapabilityRes}
        hasInput={false}
        title="Check Page Capability"
        name="checkPageCapability"
      />
    </>
  );
};

export default NavigationAPIs;
