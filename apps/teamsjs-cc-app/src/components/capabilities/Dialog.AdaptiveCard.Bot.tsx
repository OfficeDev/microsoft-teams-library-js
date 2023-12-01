import * as adaptiveCardJsonData from "./data/dialog.adaptivecard.example.format.json";

import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, dialog } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component Open's a dialog with an adaptive card
 */
export const DialogAdaptiveCardBot = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.adaptiveCard.bot.isSupported()) {
      // return buttons to open dialog
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="dialog.adaptiveCard.bot.open()" trigger={
            <Button
              onClick={() => {
                dialog.adaptiveCard.bot.open({
                  card: JSON.stringify(adaptiveCardJsonData),
                  size: { height: 400, width: 400 },
                  completionBotId: "", //Provide bot id
                  title: "Dialog Adaptive Card Bot"
                }, (response) => {
                  console.log("submitHandler:", response.result);
                });
              }}
            >
              Open Dialog Adaptive Card Bot
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
