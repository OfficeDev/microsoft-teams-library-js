import { dataLayer } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckDataLayerCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkDataLayerCapability',
    title: 'Check DataLayer Capability',
    onClick: async () => `DataLayer ${dataLayer.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetDataLayerPort = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getDataLayerPort',
    title: 'Check DataLayer Port',
    onClick: async () => {
      const port = await dataLayer.getDataLayerPort();
      port.postMessage('test message through DataLayer Port');
      return `DataLayer port: ${port}`;
    },
  });

const DataLayerAPIs = (): React.ReactElement => (
  <ModuleWrapper title="DataLayer">
    <CheckDataLayerCapability />
    <GetDataLayerPort />
  </ModuleWrapper>
);

export default DataLayerAPIs;
