import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';
import { NaaMock } from './utils/naaMock';

const NaaRequest = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'nestedAppAuthMock',
    title: 'NAA Mock',
    onClick: {
      validateInput: () => {},
      submit: async (input) => {
        const naaMock = new NaaMock();
          const listener = (response): void => {
            alert('Received response: ' + JSON.stringify(response));
            naaMock.removeEventListener(listener);
          };
          try {
            naaMock.addEventListener(listener);
          } catch (e) {
            return 'Error while adding event listener: ' + e;
          }
          try {
            naaMock.postMessage(input);
          } catch (e) {
            return 'Error while posting message: ' + e;
          }
        return 'done';
      }
    },
  });

const NestedAppAuthAPIs = (): ReactElement => (
  <ModuleWrapper title="NAA">
    <NaaRequest />
  </ModuleWrapper>
);

export default NestedAppAuthAPIs;
