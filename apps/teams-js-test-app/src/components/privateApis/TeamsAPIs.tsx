import { SdkError, teams } from '@microsoft/teamsjs-app-sdk';
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

  const refreshSiteUrl = (threadId: string): void => {
    const callback = (_threadId: string, error: SdkError): void => {
      if (error) {
        setRefreshSiteUrlRes(JSON.stringify(error));
      } else {
        setRefreshSiteUrlRes('Success');
      }
    };
    teams.refreshSiteUrl(threadId, callback);
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
        handleClickWithInput={refreshSiteUrl}
        output={refreshSiteUrlRes}
        hasInput={true}
        title="Refresh site url"
        name="refreshSiteUrl"
      />
    </>
  );
};

export default TeamsAPIs;
