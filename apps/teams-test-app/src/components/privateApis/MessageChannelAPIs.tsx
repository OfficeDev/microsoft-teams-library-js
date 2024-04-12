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

const GetTelemetryPort = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkTelemetryPort',
    title: 'Check Telemetry Port API',
    onClick: async () => {
      const port = await messageChannels.getTelemetryPort();
      port.postMessage('test message through telemetry port');
      return `Telemetry port: ${port}`;
    },
  });

const MessageChannelAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Message Channels">
    <GetTelemetryPort />
    <CheckMessageChannelsCapability />
  </ModuleWrapper>
);

export default MessageChannelAPIs;
