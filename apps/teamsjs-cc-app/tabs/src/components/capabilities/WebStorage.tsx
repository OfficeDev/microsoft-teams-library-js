import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { webStorage } from "@microsoft/teams-js";

/**
 * Checks if web storage gets cleared when a user logs out from host client
 */
export const WebStorage = () => {
    // check to see if capability is supported
    if (webStorage.isSupported()) {
        return (
            <Button onClick={async () => {
                const isCleared = webStorage.isWebStorageClearedOnUserLogOut();
                console.log(isCleared);
            }}>
                Is Storage Cleared On LogOut
            </Button>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const WebStorageIsSupported = () => booleanToString(webStorage.isSupported());
