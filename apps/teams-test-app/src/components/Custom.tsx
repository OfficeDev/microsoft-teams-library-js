import { registerCustomHandler, sendCustomMessage } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CustomApi = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'customAPI',
    title: 'Call Custom API',
    onClick: async () => {
      await sendCustomMessage('custom-service-test');
      return '';
    },
  });

const RegisterCustomHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerCustomHandler',
    title: 'Register Custom Handler',
    onClick: async (setResult) => {
      registerCustomHandler('custom-service-test', (result: string) => {
        setResult(result);
        return [];
      });

      return 'registered';
    },
  });

const CustomAPIs: React.FC = () => (
  <ModuleWrapper title="Custom">
    <CustomApi />
    <RegisterCustomHandler />
  </ModuleWrapper>
);

export default CustomAPIs;
