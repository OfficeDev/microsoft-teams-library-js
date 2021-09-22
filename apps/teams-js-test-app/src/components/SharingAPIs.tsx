import { SdkError, sharing } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const SharingAPIs = (): ReactElement => {
  const [shareWebContentRes, setShareWebContentRes] = React.useState('');

  const shareWebContent = (): void => {
    const shareRequest: sharing.IShareRequest<sharing.IURLContent> = {
      content: [{ type: 'URL', url: 'https://bing.com' }],
    };
    const callback = (err?: SdkError): void => {
      if (err) {
        setShareWebContentRes(JSON.stringify(err));
      } else {
        setShareWebContentRes('Success');
      }
    };
    setShareWebContentRes('sharing.shareWebContent()' + noHubSdkMsg);
    sharing.shareWebContent(shareRequest, callback);
  };

  return (
    <>
      <h1>sharing</h1>
      <BoxAndButton
        handleClick={shareWebContent}
        output={shareWebContentRes}
        hasInput={false}
        title="Share web content"
        name="share_shareWebContent"
      />
    </>
  );
};

export default SharingAPIs;
