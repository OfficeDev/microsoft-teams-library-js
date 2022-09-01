import { mail } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckMailCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityMail',
    title: 'Check Mail Call',
    onClick: async () => `Mail module ${mail.isSupported() ? 'is' : 'is not'} supported`,
  });

const ComposeMail = (): React.ReactElement =>
  ApiWithTextInput<mail.ComposeMailParams>({
    name: 'composeMail',
    title: 'Compose Mail',
    onClick: {
      validateInput: (input) => {
        const composeMailTypeValues = Object.values(mail.ComposeMailType);
        if (!input.type || !composeMailTypeValues.includes(input.type)) {
          throw new Error(`type is required and has to be one of ${JSON.stringify(composeMailTypeValues)}`);
        }
        if (
          (input.type === mail.ComposeMailType.Forward ||
            input.type === mail.ComposeMailType.Reply ||
            input.type === mail.ComposeMailType.ReplyAll) &&
          !input.itemid
        ) {
          throw new Error('itemId is required for Forward, Reply and ReplyAll');
        }
      },
      submit: async (input) => {
        await mail.composeMail(input);
        return 'Completed';
      },
    },
  });

const OpenMailItem = (): React.ReactElement =>
  ApiWithTextInput<mail.OpenMailItemParams>({
    name: 'openMailItem',
    title: 'Open Mail Item',
    onClick: {
      validateInput: (input) => {
        if (!input.itemId) {
          throw new Error('itemId is required');
        }
      },
      submit: async (input) => {
        await mail.openMailItem(input);
        return 'Completed';
      },
    },
  });

const MailAPIs = (): ReactElement => (
  <ModuleWrapper title="Mail">
    <ComposeMail />
    <OpenMailItem />
    <CheckMailCapability />
  </ModuleWrapper>
);

export default MailAPIs;
