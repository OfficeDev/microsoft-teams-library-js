import React from 'react';
import { settings } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const SettingsAPIs = () => {
  const [getSettings, setGetSettings] = React.useState("");
  const [registerOnSaveHandler, setRegisterOnSaveHandler] = React.useState("");
  const [setSettings, setSetSettings] = React.useState("");
  const [setValidityState, setSetValidityState] = React.useState("");
  const [registerOnRemoveHandler, setRegisterOnRemoveHandler] = React.useState("");

  const returnSettings = () => {
    setGetSettings("settings.getSettings()" + noHubSdkMsg);
    const onComplete = (instanceSettings: any) => {
      setGetSettings(instanceSettings);
    }
    settings.getSettings(onComplete);
  };

  const returnRegisterOnSaveHandler = () => {
    setRegisterOnSaveHandler("settings.registerOnSaveHandler()" + noHubSdkMsg);
    settings.registerOnSaveHandler((saveEvent: any) => {
      setRegisterOnSaveHandler("Save event received.");
      saveEvent.notifySuccess();
    });
  };

  const returnSetSettings = (instanceSettings: any) => {
    setSetSettings("settings.setSettings()" + noHubSdkMsg);
    const onComplete = (output: any) => {
      setSetSettings(output);
    }
    settings.setSettings(instanceSettings, onComplete);
  };

  const returnSetValidityState = (validityState: string) => {
    settings.setValidityState(validityState == 'true');
    setSetValidityState("Set validity state to " + (validityState == 'true'));
  };

  const returnRegisterOnRemoveHandler = () => {
    setRegisterOnRemoveHandler("settings.registerOnRemoveHandler()" + noHubSdkMsg);
    settings.registerOnRemoveHandler((removeEvent: any) => {
      setRegisterOnRemoveHandler("Handler registered.")
    })
  }

  return (
    <>
      <BoxAndButton
        handleClick={returnSettings}
        output={getSettings}
        hasInput={false}
        title="Get Settings"
        name="settings.getSettings"
      />
      <BoxAndButton
        handleClick={returnRegisterOnSaveHandler}
        output={registerOnSaveHandler}
        hasInput={false}
        title="Set RegisterOnSaveHandler"
        name="settings.registerOnSaveHandler"
      />
      <BoxAndButton
        handleClick={returnSetSettings}
        output={setSettings}
        hasInput={true}
        title="Set Settings"
        name="settings.setSettings"
      />
      <BoxAndButton
        handleClick={returnSetValidityState}
        output={setValidityState}
        hasInput={true}
        title="Set Validity State"
        name="settings.setValidityState"
      />
      <BoxAndButton
        handleClick={returnRegisterOnRemoveHandler}
        output={registerOnRemoveHandler}
        hasInput={false}
        title="Register On Remove Handler"
        name="settings.registerOnRemoveHandler"
      />
    </>
  );
};

export default SettingsAPIs;
