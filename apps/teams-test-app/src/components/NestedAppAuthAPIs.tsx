import { nestedAppAuth } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NestedAppAuthAPIs = (): ReactElement => {
  const CheckIsNAAChannelRecommended = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkIsNAAChannelRecommended',
      title: 'Check NAA Channel Recommended',
      onClick: async () => `NAA channel ${nestedAppAuth.isNAAChannelRecommended() ? 'is' : 'is not'} recommended`,
    });

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckIsNAAChannelRecommended />
    </ModuleWrapper>
  );
};

export default NestedAppAuthAPIs;
