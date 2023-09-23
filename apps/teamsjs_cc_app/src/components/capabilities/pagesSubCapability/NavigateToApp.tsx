import * as Fluent from "@fluentui/react-northstar";

import {
  CapabilityStatus,
  developersPortal,
  developersPortalAppPageId,
} from "../../../helpers/constants";
import { app, pages } from "@microsoft/teams-js";

import { isMobile } from "react-device-detect";

/**
 * This component returns a button which navigates to an App with provided appId.
 */
export const NavigateToApp = () => {
  // Check if app is initialized;
  if (app.isInitialized()) {
    return (
      <Fluent.Segment className="ui-pagessegment">
        <Fluent.Header content="Navigate To App" as="h3" />
        <Fluent.Flex gap="gap.small" vAlign="center">
          <Fluent.Text
            className="ui-pagestext"
            content="Navigate to the given application ID and page ID, with optional parameters for a WebURL (if the application cannot be navigated to, such as if it is not installed), Channel ID (for applications installed as a channel tab), and sub-page ID (for navigating to specific content within the page). This is equivalent to navigating to a deep link with the above data, but does not require the application to build a URL or worry about different deep link formats for different hosts."
          />
        </Fluent.Flex>
        <Fluent.Flex space="between">
          {pages.isSupported() ?
            <Fluent.Tooltip content="pages.navigateToApp()" trigger={
              <Fluent.Button
                onClick={async () => {
                  // navigate to the Apps tab in the Developer Portal app
                  await pages.navigateToApp({
                    appId: developersPortal.appId,
                    pageId: developersPortalAppPageId,
                  });
                }}
              >
                Click me to Navigate to App
              </Fluent.Button>
            } /> :
            <Fluent.Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">Sub-Capability is not supported</Fluent.Flex>
          }
        </Fluent.Flex>
      </Fluent.Segment>
    )
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
