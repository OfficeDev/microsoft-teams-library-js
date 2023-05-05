import { app, appInstallDialog } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { developersPortalAppId } from "../../helpers/constants";

/**
 * This component Open's a dialog with particular application to install.
 */
export const AppInstallDialog = () => {
  // Check if app is initialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (appInstallDialog.isSupported()) {
      // return button to open dialog
      return (
        <Button
          onClick={async () => {
            // open the install dialog for the Developer Portal app
            await appInstallDialog.openAppInstallDialog({
              appId: developersPortalAppId,
            });
          }}
        >
          Open App Install Dialog
        </Button>
      );
    }
  }
  // return's if capability is not supported.
  return <>Capability is not supported</>;
};

export const AppInstallDialogIsSupported = () =>
  booleanToString(appInstallDialog.isSupported());
