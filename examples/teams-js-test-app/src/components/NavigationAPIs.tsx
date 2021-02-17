import React from 'react';
import BoxAndButton from "./BoxAndButton";
import CheckboxAndButton from "./CheckboxAndButton";
import { noHubSdkMsg } from "../App"

const NavigationAPIs = () => {
  const [navigateCrossDomain, setNavigateCrossDomain] = React.useState("");
  const [focus, setReturnFocus] = React.useState("");

  const returnNavigateCrossDomain = (url: string) => {
    setNavigateCrossDomain("navigateCrossDomain()" + noHubSdkMsg);
    let inputUrl = JSON.stringify(url);
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setNavigateCrossDomain(reason);
      } else {
        setNavigateCrossDomain("Completed");
      }
    };
    teamsjs.navigateCrossDomain(inputUrl, onComplete);
  };

  const returnFocus = (navigateForward: any) => {
    setReturnFocus("Current navigateForward state is " + navigateForward);
    teamsjs.returnFocus(navigateForward);
  };
  return (
    <>
      <BoxAndButton
        handleClick={returnNavigateCrossDomain}
        output={navigateCrossDomain}
        hasInput={true}
        title="Navigate Cross Domain"
        name="navigateCrossDomain"
      />
      <CheckboxAndButton
        handleClick={returnFocus}
        output={focus}
        hasInput={false}
        title="Return Focus"
        name="returnFocus"
        hasTitle={true}
        checkBoxTitle="navigateForward:"
      />
    </>
  );
};

export default NavigationAPIs;
