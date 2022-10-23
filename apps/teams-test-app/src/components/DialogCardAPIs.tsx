/* eslint-disable @typescript-eslint/ban-types */
import { AdaptiveCardDialogInfo, dialog } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogCardAPIs = (): ReactElement => {
  const CheckDialogAdaptiveCardCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialogAdaptiveCard',
      title: 'Check Capability Dialog Adaptive Card',
      onClick: async () => {
        if (dialog.adaptiveCard.isSupported()) {
          return 'Dialog Adaptive Card module is supported';
        } else {
          return 'Dialog Adaptive Card module is not supported';
        }
      },
    });

  const OpenAdaptiveCardDialog = (): ReactElement =>
    ApiWithTextInput<AdaptiveCardDialogInfo>({
      name: 'dialogAdaptiveCardOpen',
      title: 'Dialog Adaptive Card Open',
      onClick: {
        validateInput: (input) => {
          if (input.card === undefined) {
            throw 'Card is undefined';
          }
        },
        submit: async (adaptiveCardDialogInfo, setResult) => {
          const onComplete = (resultObj: dialog.ISdkResponse): void => {
            setResult('Error: ' + resultObj.err + '\nResult: ' + resultObj.result);
          };
          dialog.adaptiveCard.open(adaptiveCardDialogInfo as AdaptiveCardDialogInfo, onComplete);
          return '';
        },
      },
    });
  return (
    <ModuleWrapper title="Dialog.Card">
      <CheckDialogAdaptiveCardCapability />
      <OpenAdaptiveCardDialog />
    </ModuleWrapper>
  );
};

export default DialogCardAPIs;
