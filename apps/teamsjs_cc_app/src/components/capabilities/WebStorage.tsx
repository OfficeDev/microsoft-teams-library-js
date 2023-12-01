import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, webStorage } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * Checks if web storage gets cleared when a user logs out from host client
 */
export const WebStorage = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (webStorage.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="webStorage.isWebStorageClearedOnUserLogOut()" trigger={
            <Button
              onClick={() => {
                const isCleared = webStorage.isWebStorageClearedOnUserLogOut();
                alert("isWebStorageClearedOnUserLogOut" + isCleared);
              }}
            >
              Is Storage Cleared On LogOut
            </Button>
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
