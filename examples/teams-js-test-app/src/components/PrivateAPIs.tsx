import React, { ReactElement } from 'react';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const PrivateAPIs = (): ReactElement => {
  const [openFilePreview, setOpenFilePreview] = React.useState('');
  const [getChatMembers, setGetChatMembers] = React.useState('');
  const [getUserJoinedTeams, setGetUserJoinedTeams] = React.useState('');

  const returnOpenFilePreview = (filePreviewParamsInput: string): void => {
    let filePreviewParams: teamsjs.FilePreviewParameters = JSON.parse(filePreviewParamsInput);
    setOpenFilePreview('openFilePreview()' + noHubSdkMsg);
    teamsjs.openFilePreview(filePreviewParams);
  };

  const returnGetChatMembers = (): void => {
    setGetChatMembers('getChatMembers()' + noHubSdkMsg);
    const onComplete = (chatMembersInformation: teamsjs.ChatMembersInformation): void => {
      setGetChatMembers(JSON.stringify(chatMembersInformation));
    };
    teamsjs.getChatMembers(onComplete);
  };

  const returnGetUserJoinedTeams = (teamInstanceParamsInput: string): void => {
    let teamInstanceParams = JSON.parse(teamInstanceParamsInput);
    setGetUserJoinedTeams('getUserJoinedTeams()' + noHubSdkMsg);
    const onComplete = (userJoinedTeamsInfo: teamsjs.UserJoinedTeamsInformation): void => {
      setGetUserJoinedTeams(JSON.stringify(userJoinedTeamsInfo));
    };
    teamsjs.getUserJoinedTeams(onComplete, teamInstanceParams);
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnOpenFilePreview}
        output={openFilePreview}
        hasInput={true}
        title="Open File Preview"
        name="openFilePreview"
      />
      <BoxAndButton
        handleClick={returnGetChatMembers}
        output={getChatMembers}
        hasInput={false}
        title="Get Chat Members"
        name="getChatMembers"
      />
      <BoxAndButton
        handleClick={returnGetUserJoinedTeams}
        output={getUserJoinedTeams}
        hasInput={true}
        title="Get User Joined Teams"
        name="getUserJoinedTeams"
      />
    </>
  );
};

export default PrivateAPIs;
