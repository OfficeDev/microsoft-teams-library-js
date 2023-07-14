import { pages, registerChangeSettingsHandler, settings } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const Initialize = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_initialize',
    title: 'Config Initialize',
    onClick: async () => {
      pages.config.initialize();
      return 'called';
    },
  });

const SetConfig = (): React.ReactElement =>
  ApiWithTextInput<pages.InstanceConfig>({
    name: 'config_setConfig',
    title: 'Set Config',
    onClick: {
      validateInput: (input) => {
        if (!input.contentUrl) {
          throw new Error('contentUrl is required');
        }
      },
      submit: {
        withPromise: async (input) => {
          await pages.config.setConfig(input);
          return 'Completed';
        },
        withCallback: (input, setResult) => {
          const onComplete = (status: boolean, reason?: string): void => {
            if (!status) {
              if (reason) {
                setResult(JSON.stringify(reason));
              } else {
                setResult("Status is false but there's not reason?! This shouldn't happen.");
              }
            } else {
              setResult('Completed');
            }
          };
          settings.setSettings(input, onComplete);
        },
      },
    },
  });

const RegisterOnSaveHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerOnSaveHandler',
    title: 'Set RegisterOnSaveHandler',
    onClick: {
      withPromise: async (setResult) => {
        pages.config.registerOnSaveHandler((saveEvent: pages.config.SaveEvent): void => {
          setResult('Save event received.');
          saveEvent.notifySuccess();
        });
        return 'config.registerOnSaveHandler()' + noHostSdkMsg;
      },
      withCallback: (setResult) => {
        settings.registerOnSaveHandler((saveEvent: pages.config.SaveEvent): void => {
          setResult('Save event received.');
          saveEvent.notifySuccess();
        });
      },
    },
  });

const SetValidityState = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'config_setValidityState2',
    title: 'Set Validity State',
    label: 'setValidityState',
    onClick: {
      withPromise: async (isValid) => {
        pages.config.setValidityState(isValid);
        return `Set validity state to ${isValid}`;
      },
      withCallback: (isValid) => {
        settings.setValidityState(isValid);
        return `Set validity state to ${isValid}`;
      },
    },
  });

const RegisterOnRemoveHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerOnRemoveHandler',
    title: 'Register On Remove Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.config.registerOnRemoveHandler((removeEvent: pages.config.RemoveEvent): void => {
          setResult('Remove event received.');
          removeEvent.notifySuccess();
        });
        return 'config.registerOnRemoveHandler()' + noHostSdkMsg;
      },
      withCallback: (setResult) => {
        settings.registerOnRemoveHandler((removeEvent: settings.RemoveEvent): void => {
          setResult('Remove event received.');
          removeEvent.notifySuccess();
        });
      },
    },
  });

const RegisterOnRemoveHandlerFailure = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerOnRemoveHandlerFailure',
    title: 'Register On Remove Handler Failure',
    onClick: {
      withPromise: async (setResult) => {
        pages.config.registerOnRemoveHandler((removeEvent: pages.config.RemoveEvent): void => {
          setResult('Remove event failed.');
          removeEvent.notifyFailure('someReason');
        });
        return 'config.registerOnRemoveHandler()' + noHostSdkMsg;
      },
      withCallback: (setResult) => {
        settings.registerOnRemoveHandler((removeEvent: settings.RemoveEvent): void => {
          setResult('Remove event failed.');
          removeEvent.notifyFailure('someReason');
        });
      },
    },
  });

const RegisterChangeConfigHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_registerChangeConfigsHandler',
    title: 'Register Change Config Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.config.registerChangeConfigHandler((): void => {
          setResult('successfully called');
        });
        return 'pages.config.registerChangeConfigHandler()' + noHostSdkMsg;
      },
      withCallback: (setResult) => {
        registerChangeSettingsHandler((): void => {
          setResult('successfully called');
        });
      },
    },
  });

const CheckPageConfigCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageConfigCapability',
    title: 'Check Page config Call',
    onClick: async () => `Pages.config module ${pages.config.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesConfigAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.config">
    <Initialize />
    <RegisterOnSaveHandler />
    <SetConfig />
    <SetValidityState />
    <RegisterOnRemoveHandler />
    <RegisterOnRemoveHandlerFailure />
    <RegisterChangeConfigHandler />
    <CheckPageConfigCapability />
  </ModuleWrapper>
);

export default PagesConfigAPIs;
