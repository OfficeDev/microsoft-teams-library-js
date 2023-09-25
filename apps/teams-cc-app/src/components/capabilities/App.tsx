import { Button, Flex, TextArea, Tooltip } from "@fluentui/react-northstar";

import { CapabilityStatus } from "../../helpers/constants";
import { app } from "@microsoft/teams-js";
import { booleanToString } from "../../helpers/convert";
import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component return button to get context and displays the
 * information/ context in the resizeable text area
 */
export const App = () => {
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  // check to see if app has been initialized
  if (app.isInitialized()) {
    app.registerOnThemeChangeHandler(() => {
      console.log("Theme changed");
    });

    return (
      <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
        <Tooltip
          trigger={<Button
            className="ui_context"
            onClick={async () => {
              const context = await app.getContext();
              const contextString = JSON.stringify(context, null, 3);
              setText(contextString);
              setShowText(true);
              console.log(context);
            }}>
            Get Context
          </Button>}
          content="app.getContext()"
        />
        {showText && (
          <>
            <TextArea className="ui_app" fluid inverted value={text} />
            <Button onClick={() => { setShowText(false) }}>Hide</Button>
          </>
        )}
      </Flex>
    );
  }
  // return's if app is not initialized
  return <>{CapabilityStatus.NotInitialized}</>;
};

export const AppIsSupported = () => booleanToString(true);
