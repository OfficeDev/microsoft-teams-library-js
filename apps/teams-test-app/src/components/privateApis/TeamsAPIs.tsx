import { SdkError, teams } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const GetTeamsChannels = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getTeamChannels2',
    title: 'Get Team Channels',
    onClick: {
      validateInput: (input) => {
        if (!input || typeof input !== 'string') {
          throw new Error('input is required and it has to be a string.');
        }
      },
      submit: async (groupId) => {
        return new Promise((res, rej) => {
          const onComplete = (error: SdkError, channels: teams.ChannelInfo[]): void => {
            if (error) {
              rej('getTeamChannels() error: ' + JSON.stringify(error));
            } else {
              res(JSON.stringify(channels));
            }
          };

          teams.getTeamChannels(groupId, onComplete);
        });
      },
    },
  });

const RefreshSiteUrl = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'refreshSiteUrl2',
    title: 'Refresh site url',
    onClick: {
      validateInput: (input) => {
        if (!input || typeof input !== 'string') {
          throw new Error('input is required and it has to be a string.');
        }
      },
      submit: async (input) => {
        return new Promise((res, rej) => {
          const callback = (error: SdkError): void => {
            if (error) {
              rej(JSON.stringify(error));
            } else {
              res('Success');
            }
          };

          teams.refreshSiteUrl(input, callback);
        });
      },
    },
  });

const TeamsAPIs: React.FC = () => (
  <ModuleWrapper title="TeamsAPIs">
    <GetTeamsChannels />
    <RefreshSiteUrl />
  </ModuleWrapper>
);

export default TeamsAPIs;
