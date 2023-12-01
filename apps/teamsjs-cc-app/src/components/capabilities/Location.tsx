import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, location } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component check if the user has granted permission to access their location,
 * request permission to access the user's location and get the user's location.
 */
export const Location = () => {
    // check to see if capability is supported
    // this isn't released yet, so it's not surprising that it doesn't work
    // Check to see if capability is isInitialized
    if (app.isInitialized()) {
        // Check to see if capability is supported
        if (location.isSupported()) {
            return (
                <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
                    <Tooltip content="location.getLocation()" trigger={
                        <Button
                            onClick={() => {
                                location.getLocation({ allowChooseLocation: true, showMap: true }, (handler) => {
                                    alert(JSON.stringify(handler));
                                });
                            }}
                        >
                            GetLocation
                        </Button>
                    } />
                    <Tooltip content="geoLocation.requestPermission()" trigger={
                        <Button
                            onClick={async () => {
                                try {
                                    let mylocation: any;
                                    location.getLocation({ allowChooseLocation: true, showMap: true }, (handler) => {
                                        mylocation = handler.message;
                                        alert(JSON.stringify(handler));
                                    });
                                    location.showLocation(mylocation, (handler) => {
                                        alert(JSON.stringify(handler));
                                    });
                                } catch (error) {
                                    alert(error);
                                }
                            }}
                        >
                            Request Permission
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
