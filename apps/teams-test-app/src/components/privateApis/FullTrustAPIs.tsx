import { pages, TeamInstanceParameters, teams } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckTeamsFullTrustCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkTeamsFulltrustCapability',
    title: 'Check Teams Fullrust Capability',
    onClick: async () => `Teams Fulltrust module ${teams.fullTrust.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckLegacyFullTrustCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkLegacyFulltrustCapability',
    title: 'Check Legacy Fullrust Capability',
    onClick: async () => `Legacy Fulltrust module ${teams.fullTrust.isSupported() ? 'is' : 'is not'} supported`,
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
    onClick: async (input) => {
      const result = await teams.fullTrust.joinedTeams.getUserJoinedTeams(input);
      return JSON.stringify(result);
    },
  });

const CheckTeamsFullTrustGetUserJoinedCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CheckTeamsFullTrustGetUserJoinedCapability',
    title: 'Check Teams FullTrust Joined Teams isSupported Capability',
    onClick: async () =>
      `Teams Fulltrust Joined Teams module ${teams.fullTrust.joinedTeams.isSupported() ? 'is' : 'is not'} supported`,
  });

const CheckLegacyFullTrustGetUserJoinedCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CheckLegacyFullTrustGetUserJoinedCapability',
    title: 'Check Legacy FullTrust Joined Teams isSupported Capability',
    onClick: async () =>
      `Legacy Fulltrust Joined Teams module ${teams.fullTrust.joinedTeams.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetConfigSetting = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getConfigSetting2',
    title: 'Get Config Setting',
    onClick: {
      validateInput: (input) => {
        if (!input || typeof input !== 'string') {
          throw new Error('the input should be a string.');
        }
      },
      submit: async (input) => {
        const result = await teams.fullTrust.getConfigSetting(input);
        return result;
      },
    },
  });

const FullTrustAPIs = (): ReactElement => (
  <ModuleWrapper title="FullTrustAPIs">
    <GetUserJoinedTeams />
    <GetConfigSetting />
    <EnterFullScreen />
    <ExitFullScreen />
    <CheckTeamsFullTrustGetUserJoinedCapability />
    <CheckLegacyFullTrustGetUserJoinedCapability />
    <CheckTeamsFullTrustCapability />
    <CheckLegacyFullTrustCapability />
    <CheckPagesFullTrustCapability />
  </ModuleWrapper>
);

export default FullTrustAPIs;
