import { Button, Flex, Input, Tooltip } from "@fluentui/react-northstar";

import { CapabilityStatus } from "../../helpers/constants";
import { app } from "@microsoft/teams-js";
import { booleanToString } from "../../helpers/convert";
import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component return button to get context and displays the
 * information/ context in the resizeable text area
 */
export const AppOpenLink = () => {
  const [inputVal, setInputVal] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorText, setErrorText] = useState("");
  // check to see if app has been initialized
  if (app.isInitialized()) {
    app.registerOnThemeChangeHandler(() => {
      console.log("Theme changed");
    });

    const isValidHttpUrl = (inputString: string) => {
      let url;
      try {
        url = new URL(inputString);
      } catch (e) {
        return false;
      }
      return url.protocol === "http:" || url.protocol === "https:";
    }

    return (
      <Flex gap="gap.medium" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center" style={{ width: '100%' }}>
        <Input
          className={isMobile ? "" : "ui_input"}
          placeholder="Enter any url"
          value={inputVal}
          onChange={(e) => {
            const event = e as React.ChangeEvent<HTMLInputElement>;
            const isValid = isValidHttpUrl(event.target.value);
            if (!isValid) {
              setInputVal("");
              setErrorText("Url is not valid");
              setShowError(true);
            }
            setInputVal(event.target.value);
            setIsValidUrl(isValid);
            if (isValid) {
              setErrorText("");
              setShowError(false);
            }
          }} />
        <Tooltip
          trigger={<Button
            disabled={!isValidUrl}
            className="ui_context"
            onClick={async () => {
              await app.initialize();
              if (app.isInitialized()) {
                app.openLink(inputVal);
              }
            }}>
            App OpenLink
          </Button>}
          content="app.openLink()"
        />
        {showError &&
          <Input value={errorText} />}
      </Flex>
    );
  }
  // return's if app is not initialized
  return <>{CapabilityStatus.NotInitialized}</>;
};

export const AppOpenLinkIsSupported = () => booleanToString(true);
