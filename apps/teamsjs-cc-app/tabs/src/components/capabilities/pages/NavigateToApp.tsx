import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";
import {
  developersPortalAppId,
  developersPortalAppPageId,
} from "../../../helpers/constants";

/**
 * This component returns a button which navigates to an App with provided appId.
 */
export const NavigateToApp = () => {
  // cCheck if app is initialized;
  if (app.isInitialized()) {
    return (
      <>
        {pages.isSupported() && (
          <Fluent.Segment className="ui-pagessegment">
            <Fluent.Header content="Navigate To App" as="h2" />
            <Fluent.Flex gap="gap.small" vAlign="center">
              <Fluent.Text
                className="ui-pagestext"
                content="Navigate to the given application ID and page ID, with optional parameters for a WebURL (if the application cannot be navigated to, such as if it is not installed), Channel ID (for applications installed as a channel tab), and sub-page ID (for navigating to specific content within the page). This is equivalent to navigating to a deep link with the above data, but does not require the application to build a URL or worry about different deep link formats for different hosts."
              />
            </Fluent.Flex>
            <Fluent.Flex space="between">
              <Fluent.Button
                onClick={async () => {
                  // navigate to the Apps tab in the Developer Portal app
                  await pages.navigateToApp({
                    appId: developersPortalAppId,
                    pageId: developersPortalAppPageId,
                  });
                }}
              >
                Click me to Navigate to App
              </Fluent.Button>
            </Fluent.Flex>
          </Fluent.Segment>
        )}
      </>
    );
  }
  // return's  if capability is not supported.
  return <>Capability is not initialized</>;
};
