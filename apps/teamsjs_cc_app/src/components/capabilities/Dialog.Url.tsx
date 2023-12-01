import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, dialog } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component Open's a dialog with a form and
 * on submit it logs the json value in the console and closes the dialog
 */
export const DialogUrl = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.url.isSupported()) {
      // return buttons to open dialog
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="dialog.url.submit()" trigger={
            <Button
              onClick={() => {
                const baseUrl = `https://${window.location.host}`;

                dialog.url.open({
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
              Open Dialog Url Submit
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
