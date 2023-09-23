import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns a button which returns focus to app bar.
 */
export const ReturnFocusToAppBar = () => {
  // Check if app is initialized;
  if (app.isInitialized()) {
    if (pages.isSupported()) {
      return (
        <Fluent.Segment className="ui-pagessegment">
          <Fluent.Header content="Return Focus To App Bar" as="h3" />
          <Fluent.Flex gap="gap.small" vAlign="center">
            <Fluent.Text
              className="ui-pagestext"
              content="Returns focus to the host's App bar. (Curently works only in teams)"
            />
          </Fluent.Flex>
          <Fluent.Flex space="between">
            <Fluent.Tooltip content="pages.returnFocus(false)" trigger={
              <Fluent.Button
                onClick={() => {
                  pages.returnFocus(false);
                }}
              >
                Click me Return focus to App Bar
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
