import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
import CheckboxAndButton from './CheckboxAndButton';

const NavigationAPIs = (): ReactElement => {
  const [navigateCrossDomainRes, setNavigateCrossDomainRes] = React.useState('');
  const [returnFocusRes, setReturnFocusRes] = React.useState('');
  const [navigateToTabRes, setNavigateToTabRes] = React.useState('');
  const [navigateBackRes, setNavigateBackRes] = React.useState('');
  const [checkPagesCapabilityRes, setCheckPagesCapabilityRes] = React.useState('');

  const navigateCrossDomainFunc = (url: string): void => {
    setNavigateCrossDomainRes('navigateCrossDomain()' + noHubSdkMsg);
    pages
      .navigateCrossDomain(url)
      .then(() => setNavigateCrossDomainRes('Completed'))
      .catch(reason => setNavigateCrossDomainRes(reason));
  };

  const navigateToTabFunc = (inputParams: string): void => {
    setNavigateToTabRes('navigateToTab()' + noHubSdkMsg);
    pages.tabs
      .navigateToTab(JSON.parse(inputParams))
      .then(() => setNavigateToTabRes('Completed'))
      .catch(reason => setNavigateToTabRes(reason));
  };

  const navigateBackFunc = (): void => {
    setNavigateBackRes('navigateBack()' + noHubSdkMsg);
    pages.backStack
      .navigateBack()
      .then(() => setNavigateBackRes('Completed'))
      .catch(reason => setNavigateBackRes(reason));
  };

  const returnFocusFunc = (navigateForward: string): void => {
    setReturnFocusRes('Current navigateForward state is ' + navigateForward);
    if (navigateForward) {
      pages.returnFocus(navigateForward === 'true');
    } else {
      pages.returnFocus();
    }
  };

  const returnFocus = (inputParams: string): void => {
    if (inputParams) {
      try {
        const param = JSON.parse(inputParams);
        if (param.navigateForward) {
          pages.returnFocus(param.navigateForward);
          setReturnFocusRes('called with param: ' + param.navigateForward);
          return;
        } else {
          pages.returnFocus();
        }
      } catch (error) {
        if (error instanceof Error) {
          setReturnFocusRes(error.message);
        } else {
          setReturnFocusRes(JSON.stringify(error));
        }
        return;
      }
    } else {
      pages.returnFocus();
    }
    setReturnFocusRes('called with no param');
  };

  const pagesCapabilityCheck = (): void => {
    if (pages.isSupported()) {
      setCheckPagesCapabilityRes('Pages module is supported');
    } else {
      setCheckPagesCapabilityRes('Pages module is not supported');
    }
  };
  return (
    <>
      <h1>navigation</h1>
      <BoxAndButton
        handleClickWithInput={navigateCrossDomainFunc}
        output={navigateCrossDomainRes}
        hasInput={true}
        title="Navigate Cross Domain"
        name="navigateCrossDomain"
      />
      <BoxAndButton
        handleClickWithInput={returnFocus}
        output={returnFocusRes}
        hasInput={true}
        title="Return Focus (non-checkbox)"
        // eslint-disable-next-line
        defaultInput={'{\"navigateForward\": \"true\"}'}
        name="returnFocusUncontrolled"
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
        handleClick={navigateBackFunc}
        output={navigateBackRes}
        hasInput={false}
        title="Navigate Back"
        name="navigateBack"
      />
      <BoxAndButton
        handleClick={pagesCapabilityCheck}
        output={checkPagesCapabilityRes}
        hasInput={false}
        title="Check Page Capability"
        name="checkPageCapability"
      />
    </>
  );
};

export default NavigationAPIs;
