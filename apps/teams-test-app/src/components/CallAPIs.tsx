import { call } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckCallCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityCall',
    title: 'Check Capability Call',
    onClick: async () => `Call module ${call.isSupported() ? 'is' : 'is not'} supported`,
  });

const StartCall = (): React.ReactElement =>
  ApiWithTextInput<call.StartCallParams>({
    name: 'startCall',
    title: 'Start Call',
    onClick: {
      validateInput: (input) => {
        if (!input.targets) {
          throw new Error('targets is required');
        }
        const targets = input.targets;
        if (!Array.isArray(targets) || targets.length === 0 || targets.some((x) => typeof x !== 'string')) {
          throw new Error('targets has to be a non-empty array of strings');
        }
      },
      submit: async (callParams) => {
        const result = await call.startCall(callParams);
        return 'result: ' + result;
      },
    },
  });

const CallAPIs: React.FC = () => (
  <ModuleWrapper title="Call">
    <StartCall />
    <CheckCallCapability />
  </ModuleWrapper>
);

export default CallAPIs;
