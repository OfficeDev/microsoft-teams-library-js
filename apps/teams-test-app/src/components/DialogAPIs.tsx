/* eslint-disable @typescript-eslint/ban-types */
import { dialog } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogAPIs = (): ReactElement => {
  const CheckDialogCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialog',
      title: 'Check Capability Dialog',
      onClick: async () => {
        if (dialog.isSupported()) {
          return 'Dialog module is supported';
        } else {
          return 'Dialog module is not supported';
        }
      },
    });

  return (
    <ModuleWrapper title="Dialog">
      <CheckDialogCapability />
    </ModuleWrapper>
  );
};

export default DialogAPIs;
