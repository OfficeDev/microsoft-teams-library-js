import React from 'react';
import { mail } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const MailAPIs = () => {
  const [openMailItem, setOpenMailItem] = React.useState("");
  const [composeMail, setComposeMail] = React.useState("");
  const [mailCapabilityCheck, setMailCapabilityCheck] = React.useState("");

  const returnComposeMail = (mailParams: string) => {
    setComposeMail("mail.composeMail()" + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setComposeMail(reason);
      } else {
        setComposeMail('Completed');
      }
    };
    mail.composeMail(JSON.parse(mailParams), onComplete);
  };
  
  const returnOpenMailItem = (mailParams: string) => {
    setOpenMailItem("mail.openMailItem()" + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setOpenMailItem(reason);
      } else {
        setOpenMailItem('Completed');
      }
    };
    mail.openMailItem(JSON.parse(mailParams), onComplete);
  };

  const returnMailCapabilityCheck = () => {
    if (mail.isSupported()) {
      setMailCapabilityCheck('Mail module is supported');
    } else {
      setMailCapabilityCheck('Mail module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnMailCapabilityCheck}
        output={mailCapabilityCheck}
        hasInput={false}
        title="Check Capability Mail"
        name="checkCapabilityMail"
      />
      <BoxAndButton
        handleClick={returnOpenMailItem}
        output={openMailItem}
        hasInput={true}
        title="Open Mail Item"
        name="openMailItem"
      />
      <BoxAndButton
        handleClick={returnComposeMail}
        output={composeMail}
        hasInput={true}
        title="Compose Mail"
        name="composeMail"
      />
    </>
  );
};

export default MailAPIs;
