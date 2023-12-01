import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, dialog } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component Open's a dialag in a bot application
 */
export const DialogUpdate = () => {
  // check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (dialog.update.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="dialog.update.resize()" trigger={
            <Button
              onClick={() => {
                const baseUrl = `https://${window.location.host}`;

                dialog.url.open({
                  title: "Dialog Resize Example",
                  fallbackUrl: `${baseUrl}/index.html#/privacy`,
                  url: `${baseUrl}/index.html#/dialogresize`,
                  size: { height: 400, width: 400 },
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
              Open Dialog and update size
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
