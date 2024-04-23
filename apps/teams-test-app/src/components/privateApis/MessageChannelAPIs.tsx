import { messageChannels } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckMessageChannelsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMessageChannelsCapability',
    title: 'Check Message Channels Capability',
    onClick: async () => `MessageChannels ${messageChannels.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckMessageChannelsTelemetryCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMessageChannelsTelemetryCapability',
    title: 'Check Message Channels Telemetry Capability',
    onClick: async () =>
      `MessageChannels.telemetry module ${messageChannels.telemetry.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckMessageChannelsDataLayerCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMessageChannelsDataLayerCapability',
    title: 'Check Message Channels Data Layer Capability',
    onClick: async () =>
      `MessageChannels.dataLayer module ${messageChannels.dataLayer.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetDataLayerPort = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkDataLayerPort',
    title: 'Check DataLayer Port',
    onClick: async () => {
      const port = await messageChannels.dataLayer.getDataLayerPort();
      port.postMessage('test message through DataLayer Port');
      return `DataLayer port: ${port}`;
    },
  });

const GetTelemetryPort = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkTelemetryPort',
    title: 'Check Telemetry Port API',
    onClick: async () => {
      const port = await messageChannels.telemetry.getTelemetryPort();
      port.postMessage('test message through telemetry port');
      return `Telemetry port: ${port}`;
    },
  });

const MessageChannelAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Message Channels">
    <GetTelemetryPort />
    <GetDataLayerPort />
    <CheckMessageChannelsCapability />
    <CheckMessageChannelsTelemetryCapability />
    <CheckMessageChannelsDataLayerCapability />
  </ModuleWrapper>
);

export default MessageChannelAPIs;
