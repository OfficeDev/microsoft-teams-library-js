import { profile } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckProfileCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityProfile',
    title: 'Check Profile Call',
    onClick: async () => `Profile module ${profile.isSupported() ? 'is' : 'is not'} supported`,
  });

const ShowProfile = (): React.ReactElement =>
  ApiWithTextInput<profile.ShowProfileRequest>({
    name: 'showProfile',
    title: 'Show Profile',
    defaultInput:
      '{"modality":"Card","persona":{"identifiers":{"Smtp":"test@microsoft.com"}},"targetElementBoundingRect":{"x":0,"y":0,"width":0,"height":0},"triggerType":"MouseClick"}',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw 'ShowProfileRequest is required';
        }
      },
      submit: async (input) => {
        try {
          await profile.showProfile(input);
        } catch (e) {
          if (typeof e === 'object') {
            return JSON.stringify(e);
          }

          throw e;
        }

        return '';
      },
    },
  });

const ProfileAPIs = (): ReactElement => (
  <ModuleWrapper title="Profile">
    <ShowProfile />
    <CheckProfileCapability />
  </ModuleWrapper>
);

export default ProfileAPIs;
