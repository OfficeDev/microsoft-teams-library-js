import { teams, SdkError } from '@microsoft/teamsjs-app-sdk';
import React from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const TeamsAPIs: React.FC = () => {
  const [getTeamsChannelsRes, setGetTeamsChannelsRes] = React.useState('');

  const getTeamsChannels = (groupId: string): void => {
    setGetTeamsChannelsRes('getTeamsChannel()' + noHubSdkMsg);
    const onComplete = (error: SdkError, channels: teams.ChannelInfo[]): void => {
      if (error) {
        setGetTeamsChannelsRes('getTeamsChannel() error: ' + JSON.stringify(error));
      } else {
        setGetTeamsChannelsRes(JSON.stringify(channels));
      }
    };
    teams.getTeamChannels(groupId, onComplete);
  };
  return (
    <>
      <h1>TeamsAPIs</h1>
      <BoxAndButton
        handleClickWithInput={getTeamsChannels}
        output={getTeamsChannelsRes}
        hasInput={true}
        title="Get Teams Channels"
        name="getTeamsChannels"
      />
    </>
  );
};

export default TeamsAPIs;
