import { presence } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckPresenceCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPresenceCapability',
    title: 'Check Presence Capability',
    onClick: async () => `Presence module ${presence.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetPresence = (): React.ReactElement =>
  ApiWithTextInput<{ upn: string }>({
    name: 'getPresence',
    title: 'Get Presence',
    onClick: {
      validateInput: (input) => {
        if (!input.upn) {
          throw new Error('UPN is required');
        }
      },
      submit: async (input) => {
        const result = await presence.getPresence(input);
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      upn: 'user@contoso.com',
    }),
  });

const SetPresence = (): React.ReactElement =>
  ApiWithTextInput<presence.SetPresenceParams>({
    name: 'setPresence',
    title: 'Set Presence',
    onClick: {
      validateInput: (input) => {
        if (!input.status) {
          throw new Error('Status is required');
        }
        if (!Object.values(presence.PresenceStatus).includes(input.status)) {
          throw new Error('Invalid status value');
        }
        if (!input.customMessage || input.customMessage.length < 5) {
          throw new Error('Custom message is required and must be at least 5 characters long');
        }
      },
      submit: async (input) => {
        await presence.setPresence(input);
        return 'Presence set successfully';
      },
    },
    defaultInput: JSON.stringify({
      status: presence.PresenceStatus.Available,
      customMessage: 'Working from home',
    }),
  });

const PresenceAPIs = (): React.ReactElement => (
  <ModuleWrapper title="Presence">
    <CheckPresenceCapability />
    <GetPresence />
    <SetPresence />
  </ModuleWrapper>
);

export default PresenceAPIs;
