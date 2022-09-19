import { version } from '@microsoft/teams-js';
import React from 'react';

// const GetTeamsChannels = (): React.ReactElement =>
//   ApiWithTextInput<string>({
//     name: 'getTeamChannels2',
//     title: 'Get Team Channels',
//     onClick: {
//       validateInput: (input) => {
//         if (!input || typeof input !== 'string') {
//           throw new Error('input is required and it has to be a string.');
//         }
//       },
//       submit: async (groupId) => {
//         return new Promise((res, rej) => {
//           const onComplete = (error: SdkError, channels: teams.ChannelInfo[]): void => {
//             if (error) {
//               rej('getTeamChannels() error: ' + JSON.stringify(error));
//             } else {
//               res(JSON.stringify(channels));
//             }
//           };

//           teams.getTeamChannels(groupId, onComplete);
//         });
//       },
//     },
//   });

const Version = (): React.ReactElement => (
  <div>
    Current library version: <span id="version">{version ?? 'unavailable'}</span>
  </div>
);

// const Version: React.FC = () => (
//   <ModuleWrapper title="TeamsAPIs">
//     <GetTeamsChannels />
//     <RefreshSiteUrl />
//   </ModuleWrapper>
// );

export default Version;
