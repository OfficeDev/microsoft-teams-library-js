import { nestedAppAuth } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NestedAppAuthAPIs = (): ReactElement => {
  const CheckisNAAChannelRecommended = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkisNAAChannelRecommended',
      title: 'Check NAA Channel Recommended',
      onClick: async () => {
        if (nestedAppAuth.isChannelRecommended()) {
          return 'NAA Channel Recommended';
        } else {
          return 'NAA Channel not Recommended';
        }
      },
    });

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckisNAAChannelRecommended />
    </ModuleWrapper>
  );
};

export default NestedAppAuthAPIs;
