import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, dialog } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component Open's a dialag in a bot application
 */
export const DialogUrlBot = () => {
  // check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.url.bot.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="dialog.url.bot.open()" trigger={
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
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
