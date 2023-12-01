import * as adaptiveCardJsonData from "./data/dialog.adaptivecard.example.format.json";

import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, dialog } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component Open's a dialog with an adaptive card
 */
export const DialogAdaptiveCard = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.adaptiveCard.isSupported()) {
      // return buttons to open dialog
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="dialog.adaptiveCard.open()" trigger={
            <Button
              onClick={() => {
                dialog.adaptiveCard.open(
                  {
                    card: JSON.stringify(adaptiveCardJsonData),
                    size: { height: 400, width: 400 },
                    title: "Dialog Adaptive Card",
                  },
                  (response) => {
                    console.log(response);
                  }
                );
              }}
            >
              Open Dialog Adaptive Card
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
