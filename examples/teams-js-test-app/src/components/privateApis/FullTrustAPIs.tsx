import React, { ReactElement } from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { teams, pages } from '@microsoft/teamsjs-app-sdk';

const FullTrustAPIs = (): ReactElement => {
  const [getUserJoinedTeamsRes, setGetUserJoinedTeamsRes] = React.useState('');
  const [getConfigSettingRes, setGetConfigSettingRes] = React.useState('');
  const [enterFullscreenRes, setEnterFullscreenRes] = React.useState('');
  const [exitFullscreenRes, setExitFullscreenRes] = React.useState('');
  const [checkCapabilityTeamsRes, setCheckCapabilityTeamsRes] = React.useState('');
  const [checkCapabilityPagesRes, setCheckCapabilityPagesRes] = React.useState('');

  const returnGetUserJoinedTeams = (teamInstanceParamsInput: string): void => {
    let teamInstanceParams = JSON.parse(teamInstanceParamsInput);
    setGetUserJoinedTeamsRes('getUserJoinedTeams()' + noHubSdkMsg);
    const onComplete = (userJoinedTeamsInfo: teamsjs.UserJoinedTeamsInformation): void => {
      setGetUserJoinedTeamsRes(JSON.stringify(userJoinedTeamsInfo));
    };
    teams.fullTrust.getUserJoinedTeams(onComplete, teamInstanceParams);
  };

  const returnGetConfigSetting = (key: string): void => {
    setGetConfigSettingRes('getConfigSetting()' + noHubSdkMsg);
    const onComplete = (value: string): void => {
      setGetConfigSettingRes(value);
    };
    teams.fullTrust.getConfigSetting(onComplete, key);
  };

  const returnEnterFullscreen = (): void => {
    setEnterFullscreenRes('enterFullscreen() called');
    pages.fullTrust.enterFullscreen();
  };

  const returnExitFullscreen = (): void => {
    setExitFullscreenRes('exitFullscreen() called');
    pages.fullTrust.exitFullscreen();
  };

  const checkTeamsCapability = (): void => {
    if (teams.fullTrust.isSupported()) {
      setCheckCapabilityTeamsRes('Teams Fulltrust module is supported');
    } else {
      setCheckCapabilityTeamsRes('Teams Fulltrust module is not supported');
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
        handleClickWithInput={returnEnterFullscreen}
        output={enterFullscreenRes}
        hasInput={false}
        title="Enter Fullscreen"
        name="enterFullscreen"
      />
      <BoxAndButton
        handleClickWithInput={returnExitFullscreen}
        output={exitFullscreenRes}
        hasInput={false}
        title="Exit Fullscreen"
        name="exitFullscreen"
      />
      <BoxAndButton
        handleClick={checkTeamsCapability}
        output={checkCapabilityTeamsRes}
        hasInput={false}
        title="Check Teams Fulltrust Capability"
        name="checkTeamsFulltrustCapability"
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
