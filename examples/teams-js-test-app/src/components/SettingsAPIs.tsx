import React, { ReactElement } from 'react';
import { settings } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const SettingsAPIs = (): ReactElement => {
  const [getSettingsRes, setGetSettingsRes] = React.useState('');
  const [registerOnSaveHandlerRes, setRegisterOnSaveHandlerRes] = React.useState('');
  const [setSettingsRes, setSetSettingsRes] = React.useState('');
  const [setValidityStateRes, setSetValidityStateRes] = React.useState('');
  const [registerOnRemoveHandlerRes, setRegisterOnRemoveHandlerRes] = React.useState('');

  const getSettings = (): void => {
    setGetSettingsRes('settings.getSettings()' + noHubSdkMsg);
    const onComplete = (instanceSettings: any): void => {
      setGetSettingsRes(instanceSettings);
    };
    settings.getSettings(onComplete);
  };

  const registerOnSaveHandler = (): void => {
    setRegisterOnSaveHandlerRes('settings.registerOnSaveHandler()' + noHubSdkMsg);
    settings.registerOnSaveHandler((saveEvent: any): void => {
      setRegisterOnSaveHandlerRes('Save event received.');
      saveEvent.notifySuccess();
    });
  };

  const setSettings = (instanceSettings: any): void => {
    setSetSettingsRes('settings.setSettings()' + noHubSdkMsg);
    const onComplete = (output: any): void => {
      setSetSettingsRes(output);
    };
    settings.setSettings(instanceSettings, onComplete);
  };

  const setValidityState = (validityState: string): void => {
    settings.setValidityState(validityState == 'true');
    setSetValidityStateRes('Set validity state to ' + (validityState == 'true'));
  };

  const registerOnRemoveHandler = (): void => {
    setRegisterOnRemoveHandlerRes('settings.registerOnRemoveHandler()' + noHubSdkMsg);
    settings.registerOnRemoveHandler((removeEvent: any): void => {
      setRegisterOnRemoveHandlerRes('Handler registered.');
    });
  };

  return (
    <>
      <BoxAndButton
        handleClick={getSettings}
        output={getSettingsRes}
        hasInput={false}
        title="Get Settings"
        name="settings.getSettings"
      />
      <BoxAndButton
        handleClick={registerOnSaveHandler}
        output={registerOnSaveHandlerRes}
        hasInput={false}
        title="Set RegisterOnSaveHandler"
        name="settings.registerOnSaveHandler"
      />
      <BoxAndButton
        handleClick={setSettings}
        output={setSettingsRes}
        hasInput={true}
        title="Set Settings"
        name="settings.setSettings"
      />
      <BoxAndButton
        handleClick={setValidityState}
        output={setValidityStateRes}
        hasInput={true}
        title="Set Validity State"
        name="settings.setValidityState"
      />
      <BoxAndButton
        handleClick={registerOnRemoveHandler}
        output={registerOnRemoveHandlerRes}
        hasInput={false}
        title="Register On Remove Handler"
        name="settings.registerOnRemoveHandler"
      />
    </>
  );
};

export default SettingsAPIs;
