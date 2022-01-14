import { LoadContext, teamsCore } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const EnablePrintCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'enablePrintCapability',
    title: 'Enable Print Capability',
    onClick: async () => {
      teamsCore.enablePrintCapability();
      return 'called';
    },
  });

const Print = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'print',
    title: 'Print',
    onClick: async () => {
      teamsCore.print();
      return 'called';
    },
  });

const RegisterOnLoadHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerOnLoadHandler',
    title: 'Register On Load Handler',
    onClick: async setResult => {
      teamsCore.registerOnLoadHandler((context: LoadContext): void => {
        setResult('successfully called with context:' + JSON.stringify(context));
      });

      return 'registered';
    },
  });

const RegisterBeforeUnloadHandler = (): React.ReactElement =>
  ApiWithTextInput<number>({
    name: 'registerBeforeUnload',
    title: 'Register Before Unload',
    onClick: {
      validateInput: input => {
        if (typeof input !== 'number') {
          throw new Error('input should be a number');
        }
      },
      submit: async (delay, setResult) => {
        teamsCore.registerBeforeUnloadHandler((readyToUnload): boolean => {
          setTimeout(() => {
            readyToUnload();
          }, delay);
          setResult('Success');
          return true;
        });

        return 'registered';
      },
    },
  });

const RegisterFocusEnterHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerFocusEnterHandler',
    title: 'Register On Focus Enter Handler',
    onClick: async setResult => {
      teamsCore.registerFocusEnterHandler(navigateForward => {
        setResult('successfully called with navigateForward: ' + navigateForward);
        return true;
      });
      return 'registered';
    },
  });

const CheckTeamsCoreCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkTeamsCoreCapability',
    title: 'Check TeamsCore Capability',
    onClick: async () => `TeamsCore ${teamsCore.isSupported() ? 'is' : 'is not'} supported`,
  });

const TeamsCoreAPIs = (): ReactElement => (
  <>
    <h1>teamsCore</h1>
    <EnablePrintCapability />
    <Print />
    <RegisterOnLoadHandler />
    <RegisterBeforeUnloadHandler />
    <RegisterFocusEnterHandler />
    <CheckTeamsCoreCapability />
  </>
);

export default TeamsCoreAPIs;
