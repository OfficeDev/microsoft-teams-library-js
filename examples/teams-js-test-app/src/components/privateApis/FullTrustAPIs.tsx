import React, { ReactElement } from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { getUserJoinedTeams, enterFullscreen, exitFullscreen } from '@microsoft/teamsjs-app-sdk';

const FullTrustAPIs = (): ReactElement => {
  const [getUserJoinedTeamsRes, setGetUserJoinedTeamsRes] = React.useState('');
  const [enterFullscreenRes, setEnterFullscreenRes] = React.useState('');
  const [exitFullscreenRes, setExitFullscreenRes] = React.useState('');

  const returnGetUserJoinedTeams = (teamInstanceParamsInput: string): void => {
    let teamInstanceParams = JSON.parse(teamInstanceParamsInput);
    setGetUserJoinedTeamsRes('getUserJoinedTeams()' + noHubSdkMsg);
    const onComplete = (userJoinedTeamsInfo: teamsjs.UserJoinedTeamsInformation): void => {
      setGetUserJoinedTeamsRes(JSON.stringify(userJoinedTeamsInfo));
    };
    getUserJoinedTeams(onComplete, teamInstanceParams);
  };

  const returnEnterFullscreen = (): void => {
    setEnterFullscreenRes('enterFullscreen() called');
    enterFullscreen();
  };

  const returnExitFullscreen = (): void => {
    setExitFullscreenRes('exitFullscreen() called');
    exitFullscreen();
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
    </>
  );
};

export default FullTrustAPIs;
