import { SdkError, sharing } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
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
    setShareWebContentRes('sharing.shareWebContent()' + noHostSdkMsg);
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
