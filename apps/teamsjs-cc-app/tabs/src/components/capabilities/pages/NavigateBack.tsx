import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

/**
 * This component returns a button which navigates back to last instance.
 */
export const NavigateBack = () => {
  // cCheck if app is initialized;
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
        {pages.backStack.isSupported() && (
          <Fluent.Segment className="ui-pagessegment">
            <Fluent.Header content="Navigate Back" as="h2" />
            <Fluent.Flex gap="gap.small" vAlign="center">
              <Fluent.Text
                className="ui-pagestext"
                content="Navigates back in the hosted application."
              />
            </Fluent.Flex>
            <Fluent.Flex gap="gap.small" vAlign="center">
              <Fluent.Button
                onClick={async () => {
                  await pages.backStack.navigateBack();
                }}
              >
                Click me to Navigate Back
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
