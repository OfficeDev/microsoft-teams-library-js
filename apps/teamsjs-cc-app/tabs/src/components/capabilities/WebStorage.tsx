import { app, webStorage } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * Checks if web storage gets cleared when a user logs out from host client
 */
export const WebStorage = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (webStorage.isSupported()) {
      return (
        <Button
          onClick={() => {
            const isCleared = webStorage.isWebStorageClearedOnUserLogOut();
            console.log(isCleared);
          }}
        >
          Is Storage Cleared On LogOut
        </Button>
      );
    } else {
      // return's if capability is not supported
      return <>Capability is not supported</>;
    }
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const WebStorageIsSupported = () =>
  booleanToString(webStorage.isSupported());
