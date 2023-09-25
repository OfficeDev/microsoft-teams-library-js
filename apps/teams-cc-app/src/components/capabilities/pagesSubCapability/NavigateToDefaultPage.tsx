import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns a button which navigate to the currently 
 * running application's first static page defined in the application manifest
 */
export const NavigateToDefaultPage = () => {
    // Check if app is initialized;
    if (app.isInitialized()) {
        return (
            <>
                <Fluent.Segment>
                    <Fluent.Header styles={{ margin: "unset" }} as="h2" content="Pages.CurrentApp Capability " />
                </Fluent.Segment>
                <Fluent.Segment className="ui-pagessegment">
                    {pages.currentApp.isSupported() ?
                        <>
                            <Fluent.Header content="Navigate To Default Page (Pages.CurrentApp)" as="h3" />
                            <Fluent.Flex gap="gap.small" vAlign="center">
                                <Fluent.Text
                                    className="ui-pagestext"
                                    content="Navigate to the currently running application's first static page defined in the application manifest"
                                />
                            </Fluent.Flex>
                            <Fluent.Flex space="between">

                                <Fluent.Tooltip content="pages.currentApp.navigateToDefaultPage()" trigger={
                                    <Fluent.Button
                                        onClick={async () => {
                                            await pages.currentApp.navigateToDefaultPage();
                                        }}>
                                        Navigate To Default Page
                                    </Fluent.Button>
                                } />
                            </Fluent.Flex>
                        </> :
                        <Fluent.Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">Sub-Capability is not supported</Fluent.Flex>
                    }
                </Fluent.Segment>
            </>
        )

    }
    // return's if App is not initialized.
    return <>{CapabilityStatus.NotInitialized}</>;
};
