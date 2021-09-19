import { app } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import BoxAndButton from './BoxAndButton';

const AppInitializationAPIs = (): ReactElement => {
  const [notifyLoadedRes, setNotifyLoadedRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  const [notifyFailureRes, setNotifyFailureRes] = React.useState('');

  const notifyLoaded = (): void => {
    app.notifyAppLoaded();
    setNotifyLoadedRes('called');
  };

  const notifySuccess = (): void => {
    app.notifySuccess();
    setNotifySuccessRes('called');
  };

  const notifyFailure = (reason?: string): void => {
    app.notifyFailure({
      reason: (reason as app.FailedReason) || app.FailedReason.Other,
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
