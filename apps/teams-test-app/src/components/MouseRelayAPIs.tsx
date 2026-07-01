import { mouseRelay } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckMouseRelayCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'mouseRelay_checkMouseRelayCapability',
    title: 'Check Mouse Relay Capability',
    onClick: async () => `MouseRelay ${mouseRelay.isSupported() ? 'is' : 'is not'} supported`,
  });

const EnableMouseRelayCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'mouseRelay_enableMouseRelayCapability',
    title: 'Enable Mouse Relay Capability',
    onClick: async () => {
      await mouseRelay.enableMouseRelayCapability();
      return 'Mouse relay enabled. Now press the physical mouse back (X1) / forward (X2) button to relay navigation to the host.';
    },
  });

const DisableMouseRelayCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'mouseRelay_disableMouseRelayCapability',
    title: 'Disable Mouse Relay Capability',
    onClick: async () => {
      mouseRelay.disableMouseRelayCapability();
      return 'called';
    },
  });

const MouseRelayAPIs = (): React.ReactElement => (
  <>
    <ModuleWrapper title="MouseRelay">
      <CheckMouseRelayCapability />
      <EnableMouseRelayCapability />
      <DisableMouseRelayCapability />
    </ModuleWrapper>
  </>
);

export default MouseRelayAPIs;
