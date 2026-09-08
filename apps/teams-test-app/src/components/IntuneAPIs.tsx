import { intune } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckIntuneCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkIntuneCapability',
    title: 'Check Intune Capability',
    onClick: async () => `Intune module ${intune.isSupported() ? 'is' : 'is not'} supported`,
  });

const IsSaveToLocationAllowed = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'isSaveToLocationAllowed',
    title: 'Is Save To Location Allowed',
    onClick: async (input) => {
      const location = input as intune.SaveLocation;
      const result = await intune.isSaveToLocationAllowed(location);
      return `Save to ${input}: ${result ? 'Allowed' : 'Not Allowed'}`;
    },
    defaultInput: JSON.stringify(intune.SaveLocation.LOCAL),
  });

const IsOpenFromLocationAllowed = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'isOpenFromLocationAllowed',
    title: 'Is Open From Location Allowed',
    onClick: async (input) => {
      const location = input as intune.OpenLocation;
      const result = await intune.isOpenFromLocationAllowed(location);
      return `Open from ${input}: ${result ? 'Allowed' : 'Not Allowed'}`;
    },
    defaultInput: JSON.stringify(intune.OpenLocation.LOCAL),
  });

const IntuneAPIs = (): ReactElement => (
  <ModuleWrapper title="Intune">
    <CheckIntuneCapability />
    <IsSaveToLocationAllowed />
    <IsOpenFromLocationAllowed />
  </ModuleWrapper>
);

export default IntuneAPIs;
