import { app, appInstallDialog } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component Open's a dialog with particular application to install.
 */
export const AppInstallDialog = async () => {
    // Initialize the Microsoft Teams SDK
    await app.initialize();
    // Check if app is initialized
    if (app.isInitialized()) {
        // check to see if capability is supported
        if (appInstallDialog.isSupported()) {
            // return button to open dialog
            return (
                <Button onClick={async () => {
                    // open the install dialog for the Developer Portal app
                    await appInstallDialog.openAppInstallDialog({
                        appId: '14072831-8a2a-4f76-9294-057bf0b42a68'
                    });
                }}>
                    Open App Install Dialog
                </Button>
            )
        }
    }
    // return empty fragment if capability is not supported
    return (<></>);
}

export const AppInstallDialogIsSupported = () => booleanToString(appInstallDialog.isSupported());
