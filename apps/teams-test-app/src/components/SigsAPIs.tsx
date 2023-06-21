import { sigs } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const SendSignal = (): React.ReactElement =>
  ApiWithTextInput<sigs.ISignalInput>({
    name: 'sendSignal',
    title: 'Send Signal',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('Signal input is required');
        }
      },
      submit: async (input) => {
        const response = await sigs.sendSignal(input);
        return JSON.stringify(response);
      },
    },
  });

const SigsAPIs = (): ReactElement => (
  <ModuleWrapper title="Sigs">
    <SendSignal />
  </ModuleWrapper>
);

export default SigsAPIs;
