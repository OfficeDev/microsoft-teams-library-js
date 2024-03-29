import { nestedAppAuth } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NestedAppAuthAPIs = (): ReactElement => {
  const CheckisNAAChannelRecommended = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkisNAAChannelRecommended',
      title: 'Check NAA Channel Recommended',
      onClick: async () => `NAA channel ${nestedAppAuth.isChannelRecommended() ? 'is' : 'is not'} recommended`,
    });

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckisNAAChannelRecommended />
    </ModuleWrapper>
  );
};

export default NestedAppAuthAPIs;
