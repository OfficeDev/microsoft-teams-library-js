import React, { ReactElement } from 'react';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const PrivateAPIs = (): ReactElement => {
  const [showNotification, setShowNotification] = React.useState('');
  const [openFilePreview, setOpenFilePreview] = React.useState('');
  const [getChatMembers, setGetChatMembers] = React.useState('');
  const [getUserJoinedTeams, setGetUserJoinedTeams] = React.useState('');

  const returnShowNotification = (showNotificationParams: any): void => {
    showNotificationParams = JSON.parse(showNotificationParams);
    setShowNotification('showNotification()' + noHubSdkMsg);
    teamsjs.showNotification(showNotificationParams);
  };

  const returnOpenFilePreview = (filePreviewParams: any): void => {
    filePreviewParams = JSON.parse(filePreviewParams);
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

  const returnGetUserJoinedTeams = (teamInstanceParams: any): void => {
    setGetUserJoinedTeams('getUserJoinedTeams()' + noHubSdkMsg);
    const onComplete = (userJoinedTeamsInfo: any): void => {
      setGetUserJoinedTeams(JSON.stringify(userJoinedTeamsInfo));
    };
    teamsjs.getUserJoinedTeams(onComplete, teamInstanceParams);
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnShowNotification}
        output={showNotification}
        hasInput={true}
        title="Show Notification"
        name="showNotification"
      />
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
