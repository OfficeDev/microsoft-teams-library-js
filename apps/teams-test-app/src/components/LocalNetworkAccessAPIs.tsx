import { localNetworkAccess } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

interface LocalNetworkRequest {
  url: string;
}

const CheckLocalNetworkAccessCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLocalNetworkAccessCapability',
    title: 'Check Local Network Access Capability',
    onClick: async () => `localNetworkAccess module ${localNetworkAccess.isSupported() ? 'is' : 'is not'} supported`,
  });

const HasLocalNetworkAccessPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasLocalNetworkAccessPermission',
    title: 'Has Local Network Access Permission',
    onClick: async () => JSON.stringify(await localNetworkAccess.hasPermission()),
  });

const RequestLocalNetworkAccessPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestLocalNetworkAccessPermission',
    title: 'Request Local Network Access Permission',
    onClick: async () => JSON.stringify(await localNetworkAccess.requestPermission()),
  });

const FetchLocalNetworkResource = (): React.ReactElement =>
  ApiWithTextInput<LocalNetworkRequest>({
    name: 'fetchLocalNetworkResource',
    title: 'Fetch Local Network Resource',
    onClick: {
      validateInput: (input) => {
        if (!input.url) {
          throw new Error('url is required');
        }

        const url = new URL(input.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error('url must use http or https');
        }
      },
      submit: async ({ url }) => {
        const response = await fetch(url, { mode: 'no-cors' });
        return `Fetch completed. Response type: ${response.type}; status: ${response.status}.`;
      },
    },
    defaultInput: JSON.stringify({ url: 'https://192.168.1.1/' }),
  });

const LocalNetworkAccessAPIs: React.FC = () => (
  <ModuleWrapper title="Local Network Access">
    <CheckLocalNetworkAccessCapability />
    <HasLocalNetworkAccessPermission />
    <RequestLocalNetworkAccessPermission />
    <FetchLocalNetworkResource />
  </ModuleWrapper>
);

export default LocalNetworkAccessAPIs;
