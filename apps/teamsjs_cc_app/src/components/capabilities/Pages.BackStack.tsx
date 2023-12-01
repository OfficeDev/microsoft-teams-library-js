import { Flex, Text } from "@fluentui/react-northstar";
import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns a button which navigates back to last instance.
 */
export const PagesBackStack = () => {
    // Check to see if capability is isInitialized
    if (app.isInitialized()) {
        // check to see if capability is supported
        if (pages.backStack.isSupported()) {
            return (
                <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
                    <Text content="Please check the Pages Tab" />
                </Flex>
            );
        }
    } else {
        // return's if capability is not supported
        return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;

    }
    // return's if App is not initialized.
    return <>{CapabilityStatus.NotInitialized}</>;
};
