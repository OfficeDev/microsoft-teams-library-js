import { teams, SdkError } from '@microsoft/teamsjs-app-sdk';
import React from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const TeamsAPIs: React.FC = () => {
  const [getTeamChannelsRes, setGetTeamChannelsRes] = React.useState('');

  const getTeamChannels = (groupId: string): void => {
    setGetTeamChannelsRes('getTeamChannels()' + noHubSdkMsg);
    const onComplete = (error: SdkError, channels: teams.ChannelInfo[]): void => {
      if (error) {
        setGetTeamChannelsRes('getTeamChannels() error: ' + JSON.stringify(error));
      } else {
        setGetTeamChannelsRes(JSON.stringify(channels));
      }
    };
    teams.getTeamChannels(groupId, onComplete);
  };
  return (
    <>
      <h1>TeamsAPIs</h1>
      <BoxAndButton
        handleClickWithInput={getTeamChannels}
        output={getTeamChannelsRes}
        hasInput={true}
        title="Get Team Channels"
        name="getTeamChannels"
      />
    </>
  );
};

export default TeamsAPIs;
