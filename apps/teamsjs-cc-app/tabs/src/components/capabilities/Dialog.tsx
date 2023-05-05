import { app, dialog } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component Open's a dialog with a form and
 * on submit it logs the json value in the console and closes the dialog
 */
export const Dialog = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.url.isSupported()) {
      // return buttons to open dialog
      return (
        <Button
          onClick={() => {
            const baseUrl = `https://${window.location.host}`;

            dialog.url.open(
              {
                title: "Dialog Example",
                fallbackUrl: `${baseUrl}/index.html#/privacy`,
                url: `${baseUrl}/index.html#/dialog`,
                size: { height: 300, width: 500 },
              },
              (response) => {
                if (response.err) {
                  console.log(response.err);
                }
                console.log("submitHandler:", response.result);
              },
              (res) => {
                console.log("dialogListener", res);
              }
            );
          }}
        >
          Open Dialog dialog.url.submit
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

export const DialogUrlIsSupported = () =>
  booleanToString(dialog.url.isSupported());
