import { teams, SdkError } from '@microsoft/teamsjs-app-sdk';
import React from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const TeamsAPIs: React.FC = () => {
  const [getTeamChannelsRes, setGetTeamChannelsRes] = React.useState('');
  const [refreshSiteUrlRes, setRefreshSiteUrlRes] = React.useState('');

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

  const refreshSiteUrl = (): void => {
    const callback = (error: SdkError): void => {
      if (error) {
        setRefreshSiteUrlRes(JSON.stringify(error));
      } else {
        setRefreshSiteUrlRes('Success');
      }
    };
    teams.refreshSiteUrl(callback);
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
      <BoxAndButton
        handleClick={refreshSiteUrl}
        output={refreshSiteUrlRes}
        hasInput={false}
        title="Refresh site url"
        name="refreshSiteUrl"
      />
    </>
  );
};

export default TeamsAPIs;
