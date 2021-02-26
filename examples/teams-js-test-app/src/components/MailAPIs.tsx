import React, { ReactElement } from 'react';
import { mail } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const MailAPIs = (): ReactElement => {
  const [composeMailRes, setComposeMailRes] = React.useState('');
  const [openMailItemRes, setOpenMailItemRes] = React.useState('');
  const [mailCapabilityCheckRes, setMailCapabilityCheckRes] = React.useState('');

  const composeMail = (mailParams: string): void => {
    setComposeMailRes('mail.composeMail()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setComposeMailRes(reason);
      } else {
        setComposeMailRes('Completed');
      }
    };
    mail.composeMail(JSON.parse(mailParams), onComplete);
  };

  const openMailItem = (mailParams: string): void => {
    setOpenMailItemRes('mail.openMailItem()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) setOpenMailItemRes(reason);
      } else {
        setOpenMailItemRes('Completed');
      }
    };
    mail.openMailItem(JSON.parse(mailParams), onComplete);
  };

  const mailCapabilityCheck = (): void => {
    if (mail.isSupported()) {
      setMailCapabilityCheckRes('Mail module is supported');
    } else {
      setMailCapabilityCheckRes('Mail module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClick={composeMail}
        output={composeMailRes}
        hasInput={true}
        title="Compose Mail"
        name="composeMail"
      />
      <BoxAndButton
        handleClick={openMailItem}
        output={openMailItemRes}
        hasInput={true}
        title="Open Mail Item"
        name="openMailItem"
      />
      <BoxAndButton
        handleClick={mailCapabilityCheck}
        output={mailCapabilityCheckRes}
        hasInput={false}
        title="Check Capability Mail"
        name="checkCapabilityMail"
      />
    </>
  );
};

export default MailAPIs;
