/* eslint-disable @typescript-eslint/ban-types */
import { dialog, DialogSize, tasks } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogUpdateAPIs = (): ReactElement => {
  const ResizeDialog = (): ReactElement =>
    ApiWithTextInput<DialogSize>({
      name: 'dialogResize',
      title: 'Dialog Resize',
      onClick: {
        validateInput: (input) => {
          if (!input) {
            throw new Error('input is undefined');
          }
        },
        submit: async (dimensions, setResult) => {
          if (isTestBackCompat()) {
            tasks.updateTask(dimensions);
          } else {
            dialog.update.resize(dimensions);
          }
          setResult('Teams client SDK call dialog.update.resize was called');
          return '';
        },
      },
    });

  const CheckDialogResizeCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityResizeDialog',
      title: 'Check Capability Resize Dialog',
      onClick: async () => {
        if (dialog.update.isSupported()) {
          return 'Dialog.update module is supported';
        } else {
          return 'Dialog.update module is not supported';
        }
      },
    });

  return (
    <ModuleWrapper title="Dialog.Update">
      <ResizeDialog />
      <CheckDialogResizeCapability />
    </ModuleWrapper>
  );
};

export default DialogUpdateAPIs;
