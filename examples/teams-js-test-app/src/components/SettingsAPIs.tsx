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
    const onComplete = (instanceSettings: settings.Settings): void => {
      setGetSettingsRes(instanceSettings.toString());
    };
    settings.getSettings(onComplete);
  };

  const registerOnSaveHandler = (): void => {
    setRegisterOnSaveHandlerRes('settings.registerOnSaveHandler()' + noHubSdkMsg);
    settings.registerOnSaveHandler((saveEvent: settings.SaveEvent): void => {
      setRegisterOnSaveHandlerRes('Save event received.');
      saveEvent.notifySuccess();
    });
  };

  const setSettings = (instanceSettingsInput: string): void => {
    let instanceSettings: settings.Settings = JSON.parse(instanceSettingsInput);
    setSetSettingsRes('settings.setSettings()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string | undefined): void => {
      let output = '';
      if (reason) output += 'reason: ' + reason + ', \n';
      setSetSettingsRes(output + 'status: ' + status.toString());
    };
    settings.setSettings(instanceSettings, onComplete);
  };

  const setValidityState = (validityState: string): void => {
    settings.setValidityState(validityState === 'true');
    setSetValidityStateRes('Set validity state to ' + (validityState === 'true'));
  };

  const registerOnRemoveHandler = (): void => {
    setRegisterOnRemoveHandlerRes('settings.registerOnRemoveHandler()' + noHubSdkMsg);
    settings.registerOnRemoveHandler((removeEvent: settings.RemoveEvent): void => {
      setRegisterOnRemoveHandlerRes('Handler registered.');
      removeEvent.notifySuccess();
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
        handleClickWithInput={setSettings}
        output={setSettingsRes}
        hasInput={true}
        title="Set Settings"
        name="settings.setSettings"
      />
      <BoxAndButton
        handleClickWithInput={setValidityState}
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
