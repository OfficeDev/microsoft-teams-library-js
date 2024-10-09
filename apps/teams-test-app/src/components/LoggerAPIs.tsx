import { logger } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const TurnOnConsoleLog = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'turnOnConsoleLog',
    title: 'Turn On Console Log',
    onClick: async () => {
      logger.turnOnConsoleLog();
      return 'true';
    },
  });

const TurnOffConsoleLog = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'turnOffConsoleLog',
    title: 'Turn Off Console Log',
    onClick: async () => {
      logger.turnOffConsoleLog();
      return 'true';
    },
  });
const LoggerAPIs = (): ReactElement => (
  <ModuleWrapper title="Logger">
    <TurnOnConsoleLog />
    <TurnOffConsoleLog />
  </ModuleWrapper>
);

export default LoggerAPIs;
