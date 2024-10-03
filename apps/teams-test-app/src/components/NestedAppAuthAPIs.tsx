import { nestedAppAuth } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';
import { NaaMock } from './utils/naaMock';

const NaaRequest = (): ReactElement =>
  ApiWithTextInput<NestedAppAuthRequest>({
    name: 'nestedAppAuthMock',
    title: 'NAA Mock',
    defaultInput: JSON.stringify({ requestId: '123', messageType: 'NestedAppAuthRequest', body: 'test' }),
    onClick: {
      validateInput: (input) => {
        if (!input.requestId) {
          throw new Error('requestId is required');
        }
      },
      submit: async (input, setResult) => {
        const naaMock = new NaaMock();
        const listener = (response): void => {
          console.log(response);
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.requestId !== input.requestId) {
            alert('Received response for a different request: ' + JSON.stringify(response));
          }
          alert('Received response: ' + JSON.stringify(parsedResponse));
          setResult('Received response: ' + JSON.stringify(parsedResponse));
          naaMock.removeEventListener(listener);
        };
        try {
          naaMock.addEventListener(listener);
        } catch (e) {
          return 'Error while adding event listener: ' + e;
        }
        try {
          naaMock.postMessage(JSON.stringify(input));
        } catch (e) {
          return 'Error while posting message: ' + e;
        }
        return 'done';
      },
    },
  });

type NestedAppAuthRequest = {
  requestId: string;
  body?: string;
};

const NestedAppAuthAPIs = (): ReactElement => {
  const CheckIsNAAChannelRecommended = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkIsNAAChannelRecommended',
      title: 'Check NAA Channel Recommended',
      onClick: async () => `NAA channel ${nestedAppAuth.isNAAChannelRecommended() ? 'is' : 'is not'} recommended`,
    });

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckIsNAAChannelRecommended />
      <NaaRequest />
    </ModuleWrapper>
  );
};

export default NestedAppAuthAPIs;
