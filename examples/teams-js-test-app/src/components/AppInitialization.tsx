import React, { ReactElement } from 'react';
import { appInitialization } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';

const AppInitializationAPIs = (): ReactElement => {
  const [notifyLoadedRes, setNotifyLoadedRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  const [notifyFailureRes, setNotifyFailureRes] = React.useState('');

  const notifyLoaded = (): void => {
    appInitialization.notifyAppLoaded();
    setNotifyLoadedRes('called');
  };

  const notifySuccess = (): void => {
    appInitialization.notifySuccess();
    setNotifySuccessRes('called');
  };

  const notifyFailure = (reason?: string): void => {
    appInitialization.notifyFailure({
      reason: (reason as appInitialization.FailedReason) || appInitialization.FailedReason.Other,
    });
    setNotifyFailureRes('called');
  };

  return (
    <>
      <h1>appInitialization</h1>
      <BoxAndButton
        handleClick={notifyLoaded}
        output={notifyLoadedRes}
        hasInput={false}
        title="appInitialization.appLoaded"
        name="appInitializationAppLoaded"
      />
      <BoxAndButton
        handleClick={notifySuccess}
        output={notifySuccessRes}
        hasInput={false}
        title="appInitialization.success"
        name="appInitializationSuccess"
      />
      <BoxAndButton
        handleClickWithInput={notifyFailure}
        output={notifyFailureRes}
        hasInput={true}
        title="appInitialization.failure"
        name="appInitializationFailure"
      />
    </>
  );
};

export default AppInitializationAPIs;
