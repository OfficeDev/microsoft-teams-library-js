import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from './utils';

const Initialize = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_initialize',
    title: 'Config Initialize',
    onClick: async () => {
      pages.config.initialize();
      return 'called';
    },
  });

const GetConfig = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_getConfig',
    title: 'Get Config',
    onClick: async () => {
      const result = await pages.config.getConfig();
      return JSON.stringify(result);
    },
  });

const SetConfig = (): React.ReactElement =>
  ApiWithTextInput<pages.config.Config>({
    name: 'config_setConfig',
    title: 'Set Config',
    onClick: {
      validateInput: input => {
        if (!input.contentUrl) {
          throw new Error('contentUrl is required');
        }
      },
      submit: async input => {
        await pages.config.setConfig(input);
        return 'Completed';
      },
    },
  });

const RegisterOnSaveHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerOnSaveHandler',
    title: 'Set RegisterOnSaveHandler',
    onClick: async setResult => {
      pages.config.registerOnSaveHandler((saveEvent: pages.config.SaveEvent): void => {
        setResult('Save event received.');
        saveEvent.notifySuccess();
      });
      return 'config.registerOnSaveHandler()' + noHostSdkMsg;
    },
  });

const SetValidityState = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'config_setValidityState2',
    title: 'Set Validity State',
    label: 'setValidityState',
    onClick: async isValid => {
      pages.config.setValidityState(isValid);
      return `Set validity state to ${isValid}`;
    },
  });

const RegisterOnRemoveHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerOnRemoveHandler',
    title: 'Register On Remove Handler',
    onClick: async setResult => {
      pages.config.registerOnRemoveHandler((removeEvent: pages.config.RemoveEvent): void => {
        setResult('Remove event received.');
        removeEvent.notifySuccess();
      });
      return 'config.registerOnRemoveHandler()' + noHostSdkMsg;
    },
  });

const RegisterOChangeConfigHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerChangeConfigsHandler',
    title: 'Register Change Config Handler',
    onClick: async setResult => {
      pages.config.registerChangeConfigHandler((): void => {
        setResult('successfully called');
      });
      return 'pages.config.registerChangeConfigHandler()' + noHostSdkMsg;
    },
  });

const CheckPageConfigCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageConfigCapability',
    title: 'Check Page config Call',
    onClick: async () => `Pages.config module ${pages.config.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesConfigAPIs = (): ReactElement => (
  <>
    <h1>pages.config</h1>
    <Initialize />
    <GetConfig />
    <RegisterOnSaveHandler />
    <SetConfig />
    <SetValidityState />
    <RegisterOnRemoveHandler />
    <RegisterOChangeConfigHandler />
    <CheckPageConfigCapability />
  </>
);

export default PagesConfigAPIs;
