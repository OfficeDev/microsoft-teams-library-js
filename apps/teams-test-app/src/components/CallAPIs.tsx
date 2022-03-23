import { call } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithTextInput } from './utils';
import { SupportButton } from './utils/SupportButton/SupportButton';

const CheckCallCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkCapabilityCall',
    module: 'Call',
    isSupported: call.isSupported(),
  });

const StartCall = (): React.ReactElement =>
  ApiWithTextInput<call.StartCallParams>({
    name: 'startCall',
    title: 'Start Call',
    onClick: {
      validateInput: input => {
        if (!input.targets) {
          throw new Error('targets is required');
        }
        const targets = input.targets;
        if (!Array.isArray(targets) || targets.length === 0 || targets.some(x => typeof x !== 'string')) {
          throw new Error('targets has to be a non-empty array of strings');
        }
      },
      submit: async callParams => {
        const result = await call.startCall(callParams);
        return 'result: ' + result;
      },
    },
  });

const CallAPIs: React.FC = () => (
  <>
    <h1>call</h1>
    <CheckCallCapability />
    <StartCall />
  </>
);

export default CallAPIs;
