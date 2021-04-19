import React, { ReactElement } from 'react';
import {
  ChatMembersInformation,
  FilePreviewParameters,
  getChatMembers,
  openFilePreview,
} from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const PrivateAPIs = (): ReactElement => {
  const [openFilePreviewRes, setOpenFilePreviewRes] = React.useState('');
  const [getChatMembersRes, setGetChatMembersRes] = React.useState('');

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
    </>
  );
};

export default PrivateAPIs;
