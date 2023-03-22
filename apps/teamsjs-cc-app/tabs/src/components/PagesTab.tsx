import * as Fluent from "@fluentui/react-northstar";

import React, { useContext, useState } from "react";
import { app, pages } from "@microsoft/teams-js";

import NavigateBack from "./capabilities/NavigateBack";
import { TeamsFxContext } from "./Context";

/**
 * This component is used to Navigate back in the hosted application.
 */
const PagesTab = () => {
    const [isText, showText] = useState(false);
    const { themeString } = useContext(TeamsFxContext);
    // Initialize the Microsoft Teams SDK
    app.initialize();
    // Check if app is initialized
    if (app.isInitialized()) {
        return (
            <div className={themeString === "default" ? "" : "dark"}>
                <NavigateBack />
                <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Navigate To App" as="h2" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text className="ui-pagestext" content="Navigate to the given application ID and page ID, with optional parameters for a WebURL (if the application cannot be navigated to, such as if it is not installed), Channel ID (for applications installed as a channel tab), and sub-page ID (for navigating to specific content within the page). This is equivalent to navigating to a deep link with the above data, but does not require the application to build a URL or worry about different deep link formats for different hosts." />
                    </Fluent.Flex>
                    <Fluent.Flex space="between">
                        <Fluent.Button className="ui-pagesbtn" onClick={async () => {
                            // navigate to the Apps tab in the Developer Portal app
                            await pages.navigateToApp({
                                appId: '14072831-8a2a-4f76-9294-057bf0b42a68',
                                pageId: '72c73d2e-a890-4580-9c68-513c8cb6efcd'
                            })
                        }}>
                            Click me to Navigate to 'Developer Portal' App
                        </Fluent.Button>
                    </Fluent.Flex>
                </Fluent.Segment>
                <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Return Focus To App Bar" as="h2" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text className="ui-pagestext" content="Return focus to the host. Will move focus forward or backward based on where the application container falls in the F6/tab order in the host. On mobile hosts or hosts where there is no keyboard interaction or UI notion of 'focus' this function has no effect and will be a no-op when called." />
                    </Fluent.Flex>
                    <Fluent.Flex space="between"><Fluent.Button onClick={() => {
                        pages.returnFocus(false);
                    }}>
                        Click me Return focus to App Bar
                    </Fluent.Button>
                    </Fluent.Flex>
                </Fluent.Segment>
                <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Return Focus To Search Box" as="h2" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text className="ui-pagestext" content="Return focus to the host. Will move focus forward or backward based on where the application container falls in the F6/tab order in the host. On mobile hosts or hosts where there is no keyboard interaction or UI notion of 'focus' this function has no effect and will be a no-op when called." />
                    </Fluent.Flex>
                    <Fluent.Flex space="between"><Fluent.Button onClick={async () => {
                        pages.returnFocus(true);
                    }}>
                        Click me to Return focus to search box
                    </Fluent.Button></Fluent.Flex>
                </Fluent.Segment>
                <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Set Current Frame to 'Terms of Use'" as="h2" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text className="ui-pagestext" content="Sets/Updates the current frame with new information." />
                    </Fluent.Flex>
                    <Fluent.Flex space="between"><Fluent.Button onClick={() => {
                        const baseUrl = `https://${window.location.hostname}:${window.location.port}`;
                        pages.setCurrentFrame({
                            contentUrl: `${baseUrl}/#/termsofuse`,
                            websiteUrl: `${baseUrl}/#/termsofuse`
                        });
                        showText(true);
                    }}>
                        Set Current Frame to 'Terms of Use'
                    </Fluent.Button>
                    </Fluent.Flex>
                    {isText &&
                        <Fluent.Flex gap="gap.small" vAlign="center">
                            <Fluent.Text className="ui-pagestext" content="Please reload tab to see the effect." />
                        </Fluent.Flex>
                    }
                </Fluent.Segment>
                <Fluent.Segment className="ui-pagessegment">
                    <Fluent.Header content="Share Deep Link" as="h2" />
                    <Fluent.Flex gap="gap.small" vAlign="center">
                        <Fluent.Text className="ui-pagestext" content="Shares a deep link that a user can use to navigate back to a specific state in this page. Please note that this method does yet work on mobile hosts." />
                    </Fluent.Flex>
                    <Fluent.Flex space="between"><Fluent.Button onClick={async () => {
                        pages.shareDeepLink({
                            subPageId: "72c73d2e-a890-4580-9c68-513c8cb6efcd",
                            subPageLabel: "https://www.microsoft.com"
                        });
                    }}>
                        Click me to Share Deep Link
                    </Fluent.Button></Fluent.Flex>
                </Fluent.Segment>
            </div>
        );
    }
    // return empty fragment if capability is not initialized
    return (<></>);
}


export default PagesTab;
