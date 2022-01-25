import {
  enablePrintCapability,
  LoadContext,
  print,
  registerBeforeUnloadHandler,
  registerFocusEnterHandler,
  registerOnLoadHandler,
  teamsCore,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const EnablePrintCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'enablePrintCapability',
    title: 'Enable Print Capability',
    onClick: {
      withPromise: async () => {
        teamsCore.enablePrintCapability();
        return 'called';
      },
      withCallback: setResult => {
        enablePrintCapability();
        setResult('called');
      },
    },
  });

const Print = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'print',
    title: 'Print',
    onClick: {
      withPromise: async () => {
        teamsCore.print();
        return 'called';
      },
      withCallback: setResult => {
        print();
        setResult('called');
      },
    },
  });

const RegisterOnLoadHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerOnLoadHandler',
    title: 'Register On Load Handler',
    onClick: {
      withPromise: async setResult => {
        teamsCore.registerOnLoadHandler((context: LoadContext): void => {
          setResult('successfully called with context:' + JSON.stringify(context));
        });

        return 'registered';
      },
      withCallback: setResult => {
        registerOnLoadHandler((context: LoadContext): void => {
          setResult('successfully called with context:' + JSON.stringify(context));
        });

        setResult('registered');
      },
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
      submit: {
        withPromise: async (delay, setResult) => {
          teamsCore.registerBeforeUnloadHandler((readyToUnload): boolean => {
            setTimeout(() => {
              readyToUnload();
            }, delay);
            alert(`beforeUnload received; calling readyToUnload in ${delay / 1000} seconds`);
            setResult('Success');
            return true;
          });

          return 'registered';
        },
        withCallback: (delay, setResult) => {
          registerBeforeUnloadHandler((readyToUnload): boolean => {
            setTimeout(() => {
              readyToUnload();
            }, delay);
            alert(`beforeUnload received; calling readyToUnload in ${delay / 1000} seconds`);
            setResult('Success');
            return true;
          });

          setResult('registered');
        },
      },
    },
  });

const RegisterFocusEnterHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerFocusEnterHandler',
    title: 'Register On Focus Enter Handler',
    onClick: {
      withPromise: async setResult => {
        teamsCore.registerFocusEnterHandler(navigateForward => {
          setResult('successfully called with nativateForward:' + navigateForward);
          return true;
        });
        return 'registered';
      },
      withCallback: setResult => {
        registerFocusEnterHandler(navigateForward => {
          setResult('successfully called with nativateForward:' + navigateForward);
          return true;
        });
        setResult('registered');
      },
    },
  });

const TeamsCoreAPIs = (): ReactElement => (
  <>
    <h1>teamsCore</h1>
    <EnablePrintCapability />
    <Print />
    <RegisterOnLoadHandler />
    <RegisterBeforeUnloadHandler />
    <RegisterFocusEnterHandler />
  </>
);

export default TeamsCoreAPIs;
