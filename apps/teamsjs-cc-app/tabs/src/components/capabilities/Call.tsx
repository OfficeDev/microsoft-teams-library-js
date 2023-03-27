import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { call } from "@microsoft/teams-js";

/**
 * This component returns button to start a call.
 */
export const Call = () => {
    // check to see if capability is supported
    if (call.isSupported()) {
        // return button to start a call
        return (
            <Button onClick={async () => {
                await call.startCall({
                    targets: [
                        'AdeleV@6plbfs.onmicrosoft.com',
                        'AlexW@6plbfs.onmicrosoft.com'
                    ],
                    requestedModalities: [
                        call.CallModalities.Audio,
                        call.CallModalities.Video,
                        call.CallModalities.VideoBasedScreenSharing,
                        call.CallModalities.Data
                    ]
                })
            }}>
                Start Call
            </Button>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const CallIsSupported = () => booleanToString(call.isSupported());
