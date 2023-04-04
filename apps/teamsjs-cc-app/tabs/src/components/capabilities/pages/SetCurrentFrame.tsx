import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import { useState } from "react";

/**
 * This component returns a button which sets current frame to any provided page.
 */
export const SetCurrentFrame = () => {
  const [isText, showText] = useState(false);

  // cCheck if app is initialized;
  if (app.isInitialized()) {
    return (
      <>
        {pages.isSupported() && (
          <Fluent.Segment className="ui-pagessegment">
            <Fluent.Header
              content="Set Current Frame to 'Terms of Use'"
              as="h2"
            />
            <Fluent.Flex gap="gap.small" vAlign="center">
              <Fluent.Text
                className="ui-pagestext"
                content="Sets/Updates the current frame with new information."
              />
            </Fluent.Flex>
            <Fluent.Flex space="between">
              <Fluent.Button
                onClick={() => {
                  const baseUrl = `https://${window.location.host}`;
                  pages.setCurrentFrame({
                    contentUrl: `${baseUrl}/#/termsofuse`,
                    websiteUrl: `${baseUrl}/#/termsofuse`,
                  });
                  showText(true);
                }}
              >
                Set Current Frame to 'Terms of Use'
              </Fluent.Button>
            </Fluent.Flex>
            {isText && (
              <Fluent.Flex gap="gap.small" vAlign="center">
                <Fluent.Text
                  className="ui-pagestext"
                  content="Please reload tab to see the effect."
                />
              </Fluent.Flex>
            )}
          </Fluent.Segment>
        )}
      </>
    );
  }
  // return's  if capability is not supported.
  return <>Capability is not initialized</>;
};
