import * as adaptiveCardJsonData from "./data/dialog.adaptivecard.json";

import { app, dialog } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

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
      );
    } else {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }
  }
  // return's  if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const DialogAdaptiveCardIsSupported = () =>
  booleanToString(dialog.adaptiveCard.isSupported());
