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

const CheckMailWithHandoffCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMailWithHandoffCapability',
    title: 'Check Mail With Handoff Call',
    onClick: async () => `MailWithHandoff module ${mail.handoff.isSupported() ? 'is' : 'is not'} supported`,
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
    defaultInput: JSON.stringify({
      type: mail.ComposeMailType.New,
      subject: 'Test Mail',
      toRecipients: ['sam@example.com'],
      ccRecipients: ['sam2@example.com'],
      bccRecipients: ['sam3@example.com'],
      message: 'This mail has been sent from the Teams Test App',
    }),
  });

const ComposeMailWithHandoff = (): React.ReactElement =>
  ApiWithTextInput<mail.handoff.ComposeMailParamsWithHandoff>({
    name: 'composeMailWithHandoff',
    title: 'Compose Mail With Handoff ID',
    onClick: {
      validateInput: (input) => {
        const composeMailTypeValues = Object.values(mail.ComposeMailType);
        if (!input.composeMailParams) {
          throw new Error('composeMailParams is required');
        }
        if (!input.composeMailParams.type || !composeMailTypeValues.includes(input.composeMailParams.type)) {
          throw new Error(`type is required and has to be one of ${JSON.stringify(composeMailTypeValues)}`);
        }
        if (
          (input.composeMailParams.type === mail.ComposeMailType.Forward ||
            input.composeMailParams.type === mail.ComposeMailType.Reply ||
            input.composeMailParams.type === mail.ComposeMailType.ReplyAll) &&
          !input.composeMailParams.itemid
        ) {
          throw new Error('itemId is required for Forward, Reply, and ReplyAll');
        }
      },
      submit: async (input) => {
        await mail.handoff.composeMailWithHandoff(input);
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      composeMailParams: {
        type: mail.ComposeMailType.New,
        subject: 'Test Mail',
        toRecipients: ['sam@example.com', 'sam1@example.com'],
        ccRecipients: ['sam2@example.com'],
        bccRecipients: ['sam3@example.com'],
        message: 'This mail has been sent from the Teams Test App',
      },
      handoffId: 'abc123',
    }),
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
    defaultInput: JSON.stringify({ itemId: '12345' }),
  });

const MailAPIs = (): ReactElement => (
  <ModuleWrapper title="Mail">
    <ComposeMail />
    <ComposeMailWithHandoff />
    <OpenMailItem />
    <CheckMailCapability />
    <CheckMailWithHandoffCapability />
  </ModuleWrapper>
);

export default MailAPIs;
