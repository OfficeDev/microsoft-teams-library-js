import React, { ReactElement } from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { legacy, pages } from '@microsoft/teamsjs-app-sdk';

const FullTrustAPIs = (): ReactElement => {
  const [getUserJoinedTeamsRes, setGetUserJoinedTeamsRes] = React.useState('');
  const [getConfigSettingRes, setGetConfigSettingRes] = React.useState('');
  const [enterFullscreenRes, setEnterFullscreenRes] = React.useState('');
  const [exitFullscreenRes, setExitFullscreenRes] = React.useState('');
  const [checkCapabilityLegacyRes, setCheckCapabilityLegacyRes] = React.useState('');
  const [checkCapabilityPagesRes, setCheckCapabilityPagesRes] = React.useState('');

  const returnGetUserJoinedTeams = (teamInstanceParamsInput: string): void => {
    const teamInstanceParams = JSON.parse(teamInstanceParamsInput);
    setGetUserJoinedTeamsRes('getUserJoinedTeams()' + noHubSdkMsg);
    const onComplete = (userJoinedTeamsInfo: teamsjs.UserJoinedTeamsInformation): void => {
      setGetUserJoinedTeamsRes(JSON.stringify(userJoinedTeamsInfo));
    };
    legacy.fullTrust.getUserJoinedTeams(onComplete, teamInstanceParams);
  };

  const returnGetConfigSetting = (key: string): void => {
    setGetConfigSettingRes('getConfigSetting()' + noHubSdkMsg);
    const onComplete = (value: string): void => {
      setGetConfigSettingRes(value);
    };
    legacy.fullTrust.getConfigSetting(onComplete, key);
  };

  const returnEnterFullscreen = (): void => {
    setEnterFullscreenRes('enterFullscreen() called');
    pages.fullTrust.enterFullscreen();
  };

  const returnExitFullscreen = (): void => {
    setExitFullscreenRes('exitFullscreen() called');
    pages.fullTrust.exitFullscreen();
  };

  const checkLegacyCapability = (): void => {
    if (legacy.fullTrust.isSupported()) {
      setCheckCapabilityLegacyRes('Legacy Fulltrust module is supported');
    } else {
      setCheckCapabilityLegacyRes('Legacy Fulltrust module is not supported');
    }
  };

  const checkPagesCapability = (): void => {
    if (pages.isSupported() && pages.fullTrust.isSupported()) {
      setCheckCapabilityPagesRes('Pages Fulltrust module is supported');
    } else {
      setCheckCapabilityPagesRes('Pages Fulltrust module is not supported');
    }
  };

  return (
    <>
      <h1>FullTrustAPIs</h1>
      <BoxAndButton
        handleClickWithInput={returnGetUserJoinedTeams}
        output={getUserJoinedTeamsRes}
        hasInput={true}
        title="Get User Joined Teams"
        name="getUserJoinedTeams"
      />
      <BoxAndButton
        handleClickWithInput={returnGetConfigSetting}
        output={getConfigSettingRes}
        hasInput={true}
        title="Get Config Setting"
        name="getConfigSetting"
      />
      <BoxAndButton
        handleClick={returnEnterFullscreen}
        output={enterFullscreenRes}
        hasInput={false}
        title="Enter Fullscreen"
        name="enterFullscreen"
      />
      <BoxAndButton
        handleClick={returnExitFullscreen}
        output={exitFullscreenRes}
        hasInput={false}
        title="Exit Fullscreen"
        name="exitFullscreen"
      />
      <BoxAndButton
        handleClick={checkLegacyCapability}
        output={checkCapabilityLegacyRes}
        hasInput={false}
        title="Check Legacy Fulltrust Capability"
        name="checkLegacyFulltrustCapability"
      />
      <BoxAndButton
        handleClick={checkPagesCapability}
        output={checkCapabilityPagesRes}
        hasInput={false}
        title="Check Pages Fulltrust Capability"
        name="checkPagesFulltrustCapability"
      />
    </>
  );
};

export default FullTrustAPIs;
