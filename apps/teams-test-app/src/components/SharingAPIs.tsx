import { SdkError, sharing } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const SharingAPIs = (): ReactElement => {
  const [shareWebContentRes, setShareWebContentRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const shareWebContent = (input: string): void => {
    const shareRequest: sharing.IShareRequest<sharing.IShareRequestContentType> = JSON.parse(input);

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

  const checkSharingCapability = (): void => {
    if (sharing.isSupported()) {
      setCapabilityCheckRes('Sharing is supported');
    } else {
      setCapabilityCheckRes('Sharing is not supported');
    }
  };

  return (
    <>
      <h1>sharing</h1>
      <BoxAndButton
        handleClickWithInput={shareWebContent}
        output={shareWebContentRes}
        hasInput={true}
        title="Share web content"
        name="share_shareWebContent"
      />
      <BoxAndButton
        handleClick={checkSharingCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Sharing Capability"
        name="checkSharingCapability"
      />
    </>
  );
};

export default SharingAPIs;
