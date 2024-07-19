import { copilot } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CopilotAPIs = (): ReactElement => {
  const CheckIfUserOfTheM365ChatAppHasLicense = (): ReactElement =>
    ApiWithoutInput({
      name: 'CheckIfUserOfTheM365ChatAppHasLicense',
      title: 'Check if logged in user has M365Chat license',
      onClick: async () => `User ${copilot.license.isSupported() ? 'does' : 'does not'} have license for the M365 Chat app`,
    });

  return (
    <ModuleWrapper title="Copilot">
      <CheckIfUserOfTheM365ChatAppHasLicense />
    </ModuleWrapper>
  );
};

export default CopilotAPIs;
