import { appPerformanceMetrics, HostMemoryMetrics } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckAppPerformanceMetricsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'appPerformanceMetrics_checkAppPerformanceMetricsCapability',
    title: 'Check App Performance Metrics Capability',
    onClick: async () => `AppPerformanceMetrics ${appPerformanceMetrics.isSupported() ? 'is' : 'is not'} supported`,
  });

const RegisterHostMemoryMetricsHandler = (): ReactElement =>
  ApiWithoutInput({
    name: 'appPerformanceMetrics_registerHostMemoryMetricsHandler',
    title: 'Register Host Memory Metrics Handler',
    onClick: async (setResult) => {
      const handler = (v: HostMemoryMetrics): void => {
        setResult(JSON.stringify(v));
      };
      appPerformanceMetrics.registerHostMemoryMetricsHandler(handler);
      return 'Registered callback!';
    },
  });

const AppAPIs = (): ReactElement => (
  <ModuleWrapper title="AppPerformanceMetrics">
    <CheckAppPerformanceMetricsCapability />
    <RegisterHostMemoryMetricsHandler />
  </ModuleWrapper>
);

export default AppAPIs;
