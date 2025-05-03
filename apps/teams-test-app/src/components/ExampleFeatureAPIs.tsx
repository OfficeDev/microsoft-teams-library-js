import { exampleFeature } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckExampleFeatureCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExampleFeatureCapability',
    title: 'Check Example Feature Capability',
    onClick: async () => `ExampleFeature module ${exampleFeature.isSupported() ? 'is' : 'is not'} supported`,
  });

const BasicCall = (): React.ReactElement =>
  ApiWithTextInput<{ input: string }>({
    name: 'exampleFeature',
    title: 'Basic Call',
    onClick: {
      validateInput: (input) => {
        if (!input.input) {
          throw new Error('Input is required');
        }
      },
      submit: async (input) => {
        const response = await exampleFeature.basicCall(input);
        return response.status;
      },
    },
    defaultInput: JSON.stringify({ input: 'test input' }),
  });

const RegisterAndRaiseEvent = (): React.ReactElement =>
  ApiWithTextInput<{ data: string }>({
    name: 'exampleFeatureEvent',
    title: 'Register and Raise Event',
    onClick: {
      validateInput: (input) => {
        if (!input.data) {
          throw new Error('Data is required');
        }
      },
      submit: async (input) => {
        return new Promise((resolve) => {
          exampleFeature.registerEventHandler((data) => {
            resolve(`event received: ${data.data}`);
          });
          window.dispatchEvent(
            new CustomEvent('exampleEvent', {
              detail: { data: input.data },
            }),
          );
        });
      },
    },
    defaultInput: JSON.stringify({ data: 'test data' }),
  });

const RaiseDirectEvent = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'exampleDirectEvent',
    title: 'Raise Direct Event',
    onClick: async () => {
      exampleFeature.raiseEvent('direct event data');
      return 'Event raised';
    },
  });

const RegularTest = (): React.ReactElement =>
  ApiWithTextInput({
    name: 'regularTest',
    title: 'Regular Test',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('Input is required');
        }
      },
      submit: async () => {
        return 'regular test complete';
      },
    },
    defaultInput: JSON.stringify({ test: 'test input' }),
  });

const ExampleFeatureAPIs = (): React.ReactElement => (
  <ModuleWrapper title="ExampleFeature">
    <CheckExampleFeatureCapability />
    <BasicCall />
    <RegisterAndRaiseEvent />
    <RaiseDirectEvent />
    <RegularTest />
  </ModuleWrapper>
);

export default ExampleFeatureAPIs;
