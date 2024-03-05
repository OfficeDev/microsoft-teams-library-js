import { Button, Flex, Input, TextArea, Tooltip } from "@fluentui/react-northstar";

import { CapabilityStatus } from "../../helpers/constants";
import { app } from "@microsoft/teams-js";
import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component return button to get context and displays the
 * information/ context in the resizeable text area
 */
export const App = () => {
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  const [contextClass, setContextClass] = useState("");

  const [inputVal, setInputVal] = useState("");
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
      <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
        <div className={contextClass}>
          <Tooltip
            trigger={<Button
              className="ui_context align-top"
              onClick={async () => {
                const context = await app.getContext();
                const contextString = JSON.stringify(context, null, 3);
                setText(contextString);
                setShowText(true);
                console.log(context);
                setContextClass("app-getcontext")
              }}>
              Get Context
            </Button>}
            content={"API: app.getContext() FrameContexts:content, sidePanel, settings, task, stage, meetingStage"}
          />
          {showText && (
            <>
              <TextArea className="ui_app" fluid inverted value={text} />
              <Button className="align-top" onClick={() => { setShowText(false); setContextClass("") }}>Hide</Button>
            </>
          )}
        </div>
        <div className="app-openlink">
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
              if (isValid) {
                setErrorText("");
                setShowError(false);
              }
            }} />
          <Tooltip
            trigger={<Button
              className="ui_context"
              onClick={async () => {
                await app.initialize();
                if (app.isInitialized()) {
                  if (inputVal && inputVal !== '') {
                    app.openLink(inputVal);
                  } else {
                    setErrorText("Url is not valid");
                    setShowError(true);
                  }
                }
              }}>
              App OpenLink
            </Button>}
            content="app.openLink()"
          />
          {showError &&
            <Input value={errorText} />
          }
        </div>
      </Flex>
    );
  }
  // return's if app is not initialized
  return <>{CapabilityStatus.NotInitialized}</>;
};

export const AppIsSupported = () => (true);
