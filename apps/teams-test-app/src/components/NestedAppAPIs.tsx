import { nestedAppAuthService } from '@microsoft/teams-js';
import {} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NestedAppAPIs = (): ReactElement => {
  const CheckisNAAChannelRecommended = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkisNAAChannelRecommended',
      title: 'Check NAA Channel Recommended',
      onClick: async () => {
        if (nestedAppAuthService.isChannelRecommended()) {
          return 'NAA Channel Recommended';
        } else {
          return 'NAA Channel not Recommended';
        }
      },
    });

  const CheckisNAABridgeAvailable = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkisNAAChannelRecommended',
      title: 'Check NAA Bridge Available',
      onClick: async () => {
        if (nestedAppAuthService.isBridgeAvailable()) {
          return 'Nested App Auth bridge is available';
        } else {
          return 'Nested App Auth bridge is not available';
        }
      },
    });

  return (
    <ModuleWrapper title="NestedAppAuth">
      <CheckisNAAChannelRecommended />
      <CheckisNAABridgeAvailable />
    </ModuleWrapper>
  );
};

export default NestedAppAPIs;
