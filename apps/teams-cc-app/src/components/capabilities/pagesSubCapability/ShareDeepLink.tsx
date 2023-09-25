import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns a button which share's deep link.
 */
export const ShareDeepLink = () => {
  // Check if app is initialized;
  if (app.isInitialized()) {
    if (pages.isSupported()) {
      return (
        <Fluent.Segment className="ui-pagessegment">
          <Fluent.Header content="Share Deep Link" as="h3" />
          <Fluent.Flex gap="gap.small" vAlign="center">
            <Fluent.Text
              className="ui-pagestext"
              content="Shares a deep link that a user can use to navigate back to a specific state in this page. Please note that this method does yet work on mobile hosts."
            />
          </Fluent.Flex>
          <Fluent.Flex space="between">
            <Fluent.Tooltip content="pages.shareDeepLink()" trigger={
              <Fluent.Button
                onClick={async () => {
                  pages.shareDeepLink({
                    subPageId: "",
                    subPageLabel: "Capability",
                  });
                }}
              >
                Click me to Share Deep Link
              </Fluent.Button>
            } />
          </Fluent.Flex>
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
