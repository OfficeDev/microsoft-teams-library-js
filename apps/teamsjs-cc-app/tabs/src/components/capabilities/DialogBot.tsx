import { app, dialog } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component Open's a dialag in a bot application
 */
export const DialogBot = () => {
  // check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.url.bot.isSupported()) {
      return (
        <Button
          onClick={() => {
            const baseUrl = `https://${window.location.host}`;
            dialog.url.bot.open(
              {
                // Specifies a bot ID to send the result of the user's interaction with the task module
                completionBotId: "",
                size: { height: 300, width: 500 },
                url: `${baseUrl}/index.html#/dialog`,
              },
              (handler) => {
                console.log("Submithandler called", handler);
              }
            );
          }}
        >
          Open Dialog Url Bot
        </Button>
      );
    } else {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }
  }
  // return's  if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const DialogUrlBotIsSupported = () =>
  booleanToString(dialog.url.bot.isSupported());
