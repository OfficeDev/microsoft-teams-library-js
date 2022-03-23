import { legacy, pages, TeamInstanceParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { SupportButton } from '../utils/SupportButton/SupportButton';

const CheckLegacyFullTrustCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkLegacyFulltrustCapability',
    module: 'Legacy Fullrust ',
    isSupported: legacy.fullTrust.isSupported(),
  });

const CheckPagesFullTrustCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkPagesFulltrustCapability',
    module: 'Pages Fullrust ',
    isSupported: pages.fullTrust.isSupported(),
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
      const result = await legacy.fullTrust.getUserJoinedTeams(input);
      return JSON.stringify(result);
    },
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
    <CheckLegacyFullTrustCapability />
    <CheckPagesFullTrustCapability />
    <GetUserJoinedTeams />
    <GetConfigSetting />
    <EnterFullScreen />
    <ExitFullScreen />
  </>
);

export default FullTrustAPIs;
