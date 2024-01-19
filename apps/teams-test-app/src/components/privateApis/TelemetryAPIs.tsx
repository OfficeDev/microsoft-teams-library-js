import { logs } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const GetTelemetryPort = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkTelemetryPort',
    title: 'Check Telemetry Port Capability',
    onClick: async () => {
      // TODO this is test app, need to look at how this should be tested
      const port = await logs.getTelemetryPort();
      return `Telemetry port: ${port}`;
    },
  });

const TelemetryAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Telemetry">
    <GetTelemetryPort />
  </ModuleWrapper>
);

export default TelemetryAPIs;
