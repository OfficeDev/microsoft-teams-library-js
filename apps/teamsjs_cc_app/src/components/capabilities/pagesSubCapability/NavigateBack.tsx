import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns a button which navigates back to last instance.
 */
export const NavigateBack = () => {
    // Check if app is initialized;
    if (app.isInitialized()) {
        // register back button event handler
        if (pages.backStack.isSupported()) {
            pages.backStack.registerBackButtonHandler(() => {
                console.log("Back button pressed");
                return true;
            });
        }
        return (
            <>
                <Fluent.Segment>
                    <Fluent.Header styles={{ margin: "unset" }} as="h2" content="Pages.BackStack Capability" />
                </Fluent.Segment>
                <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Navigate Back" as="h3" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text
                            className="ui-pagestext"
                            content="Navigates back in the hosted application."
                        />
                    </Fluent.Flex>
                    {pages.backStack.isSupported() ?
                        <Fluent.Flex gap="gap.small" vAlign="center">
                            <Fluent.Tooltip content="pages.backStack.navigateBack()" trigger={
                                <Fluent.Button
                                    onClick={async () => {
                                        await pages.backStack.navigateBack();
                                    }}
                                >
                                    Click me to Navigate Back
                                </Fluent.Button>
                            } />
                        </Fluent.Flex> :
                        <Fluent.Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">Sub-Capability is not supported</Fluent.Flex>
                    }
                </Fluent.Segment>
            </>
        )
    }
    // return's if app is not initialized.
    return <>{CapabilityStatus.NotInitialized}</>;
};
