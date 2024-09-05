import { registerCustomHandler, sendCustomMessage } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CustomApiWithEvent = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'customApiEvent',
    title: 'Call Custom API (Event)',
    onClick: async () => {
      await sendCustomMessage('custom-service-event');
      return '';
    },
  });

const CustomApiReturnData = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'customApiResponse',
    title: 'Call Custom API (Response)',
    onClick: async (setResult) => {
      await sendCustomMessage('custom-service-test', undefined, (args) => {
        setResult(args);
      });
      return '';
    },
  });

const RegisterCustomHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerCustomHandler',
    title: 'Register Custom Handler',
    onClick: async (setResult) => {
      registerCustomHandler('custom-service-event', (result: string) => {
        setResult(result);
        return [];
      });

      return 'registered';
    },
  });

const CustomAPIs: React.FC = () => (
  <ModuleWrapper title="Custom">
    <CustomApiReturnData />
    <CustomApiWithEvent />
    <RegisterCustomHandler />
  </ModuleWrapper>
);

export default CustomAPIs;
