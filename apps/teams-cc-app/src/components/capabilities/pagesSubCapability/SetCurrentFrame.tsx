import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../../helpers/constants";
import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component returns a button which sets current frame to any provided page.
 */
export const SetCurrentFrame = () => {
  const [isText, showText] = useState(false);
  // Check if app is initialized;
  if (app.isInitialized()) {
    if (pages.isSupported()) {
      return (
        <Fluent.Segment className="ui-pagessegment">
          <Fluent.Header
            content="Set Current Frame to 'Terms of Use'"
            as="h3"
          />
          <Fluent.Flex gap="gap.small" vAlign="center">
            <Fluent.Text
              className="ui-pagestext"
              content="Sets/Updates the current frame with new information."
            />
          </Fluent.Flex>
          <Fluent.Flex space="between">
            <Fluent.Tooltip content="pages.setCurrentFrame()" trigger={
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
            } />
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
      )

    } else {
      // return's if Sub capability is not supported.
      return <Fluent.Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">Sub-Capability is not supported</Fluent.Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};