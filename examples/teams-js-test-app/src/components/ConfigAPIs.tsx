import React, { ReactElement } from 'react';
import { pages } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const ConfigAPIs = (): ReactElement => {
  const [initializeRes, setInitializeRes] = React.useState('');
  const [getConfigRes, setGetConfigRes] = React.useState('');
  const [registerOnSaveHandlerRes, setRegisterOnSaveHandlerRes] = React.useState('');
  const [setConfigRes, setSetConfigRes] = React.useState('');
  const [setValidityStateRes, setSetValidityStateRes] = React.useState('');
  const [registerOnRemoveHandlerRes, setRegisterOnRemoveHandlerRes] = React.useState('');
  const [checkPagesConfigCapabilityRes, setCheckPagesConfigCapabilityRes] = React.useState('');
  const [registerChangeConfigHandlerRes, setRegisterChangeConfigHandlerRes] = React.useState('');

  const initialize = (): void => {
    pages.config.initialize();
    setInitializeRes('called');
  };

  const getConfig = (): void => {
    setGetConfigRes('config.getConfig()' + noHubSdkMsg);
    const onComplete = (instanceConfigs: pages.config.Config): void => {
      setGetConfigRes(JSON.stringify(instanceConfigs));
    };
    pages.config.getConfig(onComplete);
  };

  const registerOnSaveHandler = (): void => {
    setRegisterOnSaveHandlerRes('config.registerOnSaveHandler()' + noHubSdkMsg);
    pages.config.registerOnSaveHandler((saveEvent: pages.config.SaveEvent): void => {
      setRegisterOnSaveHandlerRes('Save event received.');
      saveEvent.notifySuccess();
    });
  };

  const setConfig = (instanceConfigInput: string): void => {
    const instanceConfig: pages.config.Config = JSON.parse(instanceConfigInput);
    setSetConfigRes('config.setConfig()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string | undefined): void => {
      let output = '';
      if (reason) output += 'reason: ' + reason + ', \n';
      setSetConfigRes(output + 'status: ' + status.toString());
    };
    pages.config.setConfig(instanceConfig, onComplete);
  };

  const setValidityState = (validityState: string): void => {
    pages.config.setValidityState(validityState === 'true');
    setSetValidityStateRes('Set validity state to ' + (validityState === 'true'));
  };

  const registerOnRemoveHandler = (): void => {
    setRegisterOnRemoveHandlerRes('config.registerOnRemoveHandler()' + noHubSdkMsg);
    pages.config.registerOnRemoveHandler((removeEvent: pages.config.RemoveEvent): void => {
      setRegisterOnRemoveHandlerRes('Remove event received.');
      removeEvent.notifySuccess();
    });
  };

  const registerChangeConfigHandler = (): void => {
    setRegisterChangeConfigHandlerRes('pages.config.registerChangeConfigHandler()' + noHubSdkMsg);
    pages.config.registerChangeConfigHandler((): void => {
      setRegisterChangeConfigHandlerRes('successfully called');
    });
  };

  const pagesConfigCapabilityCheck = (): void => {
    if (pages.config.isSupported()) {
      setCheckPagesConfigCapabilityRes('Pages.config module is supported');
    } else {
      setCheckPagesConfigCapabilityRes('Pages.config module is not supported');
    }
  };
  return (
    <>
      <BoxAndButton
        handleClick={initialize}
        output={initializeRes}
        hasInput={false}
        title="Config Initialize"
        name="config_initialize"
      />
      <BoxAndButton
        handleClick={getConfig}
        output={getConfigRes}
        hasInput={false}
        title="Get Config"
        name="config_getConfig"
      />
      <BoxAndButton
        handleClick={registerOnSaveHandler}
        output={registerOnSaveHandlerRes}
        hasInput={false}
        title="Set RegisterOnSaveHandler"
        name="config_registerOnSaveHandler"
      />
      <BoxAndButton
        handleClickWithInput={setConfig}
        output={setConfigRes}
        hasInput={true}
        title="Set Config"
        name="config_setConfig"
      />
      <BoxAndButton
        handleClickWithInput={setValidityState}
        output={setValidityStateRes}
        hasInput={true}
        title="Set Validity State"
        name="config_setValidityState"
      />
      <BoxAndButton
        handleClick={registerOnRemoveHandler}
        output={registerOnRemoveHandlerRes}
        hasInput={false}
        title="Register On Remove Handler"
        name="config_registerOnRemoveHandler"
      />
      <BoxAndButton
        handleClick={registerChangeConfigHandler}
        output={registerChangeConfigHandlerRes}
        hasInput={false}
        title="Register Change Config Handler"
        name="config_registerChangeConfigsHandler"
      />
      <BoxAndButton
        handleClick={pagesConfigCapabilityCheck}
        output={checkPagesConfigCapabilityRes}
        hasInput={false}
        title="Check Page config Capability"
        name="checkPageConfigCapability"
      />
    </>
  );
};

export default ConfigAPIs;
