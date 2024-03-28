import { messageChannels } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const GetTelemetryPort = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkTelemetryPort',
    title: 'Check Telemetry Port Capability',
    onClick: async () => {
      // TODO this is test app, need to look at how this should be tested
      const port = await messageChannels.getTelemetryPort();
      port.postMessage('test message through telemetry port');
      return `Telemetry port: ${port}`;
    },
  });

const MessageChannelAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Message Channels">
    <GetTelemetryPort />
  </ModuleWrapper>
);

export default MessageChannelAPIs;
