import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { sharing } from "@microsoft/teams-js";
/**
 * This component open's a dialog with shareable content
 */
export const Sharing = () => {
    // check to see if capability is supported
    if (sharing.isSupported()) {
        return (
            <Button onClick={async () => {
                try {
                    await sharing.shareWebContent({
                        content: [{
                            type: "URL",
                            url: "https://www.microsoft.com",
                            message: "Check out this link!",
                            preview: true
                        }]
                    });
                } catch {
                    console.log("User aborted");
                }
            }}> Share web content
            </Button>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const SharingIsSupported = () => booleanToString(sharing.isSupported());
