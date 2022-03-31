import { legacy, pages, TeamInstanceParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckLegacyFullTrustCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLegacyFulltrustCapability',
    title: 'Check Legacy Fullrust Capability',
    onClick: async () => `Legacy Fulltrust module ${legacy.fullTrust.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckPagesFullTrustCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPagesFulltrustCapability',
    title: 'Check Pages Fullrust Capability',
    onClick: async () => `Pages Fulltrust module ${pages.fullTrust.isSupported() ? 'is' : 'is not'} supported`,
  });

const EnterFullScreen = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'enterFullscreen',
    title: 'Enter Fullscreen',
    onClick: async () => {
      pages.fullTrust.enterFullscreen();
      return 'enterFullscreen() called';
    },
  });

const ExitFullScreen = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'exitFullscreen',
    title: 'Exit Fullscreen',
    onClick: async () => {
      pages.fullTrust.exitFullscreen();
      return 'exitFullscreen() called';
    },
  });

const GetUserJoinedTeams = (): React.ReactElement =>
  ApiWithTextInput<TeamInstanceParameters | undefined>({
    name: 'getUserJoinedTeams',
    title: 'Get User Joined Teams',
    onClick: async input => {
      const result = await legacy.fullTrust.joinedTeams.getUserJoinedTeams(input);
      return JSON.stringify(result);
    },
  });

const CheckLegacyFullTrustGetUserJoinedCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CheckLegacyFullTrustGetUserJoinedCapability',
    title: 'Check Legacy FullTrust Joined Teams isSupported Capability',
    onClick: async () =>
      `Legacy Fulltrust module ${legacy.fullTrust.joinedTeams.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetConfigSetting = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getConfigSetting2',
    title: 'Get Config Setting',
    onClick: {
      validateInput: input => {
        if (!input || typeof input !== 'string') {
          throw new Error('the input should be a string.');
        }
      },
      submit: async input => {
        const result = await legacy.fullTrust.getConfigSetting(input);
        return result;
      },
    },
  });

const FullTrustAPIs = (): ReactElement => (
  <>
    <h1>FullTrustAPIs</h1>
    <GetUserJoinedTeams />
    <GetConfigSetting />
    <EnterFullScreen />
    <ExitFullScreen />
    <CheckLegacyFullTrustGetUserJoinedCapability />
    <CheckLegacyFullTrustCapability />
    <CheckPagesFullTrustCapability />
  </>
);

export default FullTrustAPIs;
