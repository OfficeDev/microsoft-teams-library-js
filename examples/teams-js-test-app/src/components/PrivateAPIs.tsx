import React, { ReactElement } from 'react';
import {
  ChatMembersInformation,
  FilePreviewParameters,
  getChatMembers,
  getUserJoinedTeams,
  openFilePreview,
  UserJoinedTeamsInformation,
} from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const PrivateAPIs = (): ReactElement => {
  const [openFilePreviewRes, setOpenFilePreviewRes] = React.useState('');
  const [getChatMembersRes, setGetChatMembersRes] = React.useState('');
  const [getUserJoinedTeamsRes, setGetUserJoinedTeamsRes] = React.useState('');

  const returnOpenFilePreview = (filePreviewParamsInput: string): void => {
    let filePreviewParams: FilePreviewParameters = JSON.parse(filePreviewParamsInput);
    setOpenFilePreviewRes('openFilePreview()' + noHubSdkMsg);
    openFilePreview(filePreviewParams);
  };

  const returnGetChatMembers = (): void => {
    setGetChatMembersRes('getChatMembers()' + noHubSdkMsg);
    const onComplete = (chatMembersInformation: ChatMembersInformation): void => {
      setGetChatMembersRes(JSON.stringify(chatMembersInformation));
    };
    getChatMembers(onComplete);
  };

  const returnGetUserJoinedTeams = (teamInstanceParamsInput: string): void => {
    let teamInstanceParams = JSON.parse(teamInstanceParamsInput);
    setGetUserJoinedTeamsRes('getUserJoinedTeams()' + noHubSdkMsg);
    const onComplete = (userJoinedTeamsInfo: UserJoinedTeamsInformation): void => {
      setGetUserJoinedTeamsRes(JSON.stringify(userJoinedTeamsInfo));
    };
    getUserJoinedTeams(onComplete, teamInstanceParams);
  };

  return (
    <>
      <BoxAndButton
        handleClickWithInput={returnOpenFilePreview}
        output={openFilePreviewRes}
        hasInput={true}
        title="Open File Preview"
        name="openFilePreview"
      />
      <BoxAndButton
        handleClick={returnGetChatMembers}
        output={getChatMembersRes}
        hasInput={false}
        title="Get Chat Members"
        name="getChatMembers"
      />
      <BoxAndButton
        handleClickWithInput={returnGetUserJoinedTeams}
        output={getUserJoinedTeamsRes}
        hasInput={true}
        title="Get User Joined Teams"
        name="getUserJoinedTeams"
      />
    </>
  );
};

export default PrivateAPIs;
