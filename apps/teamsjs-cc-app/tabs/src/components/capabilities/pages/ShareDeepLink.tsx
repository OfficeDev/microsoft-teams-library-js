import * as Fluent from "@fluentui/react-northstar";

import { app, pages } from "@microsoft/teams-js";

/**
 * This component returns a button which share's deep link.
 */
export const ShareDeepLink = () => {
  // cCheck if app is initialized;
  if (app.isInitialized()) {
    return (
      <>
        {pages.isSupported() && (
          <Fluent.Segment className="ui-pagessegment">
            <Fluent.Header content="Share Deep Link" as="h2" />
            <Fluent.Flex gap="gap.small" vAlign="center">
              <Fluent.Text
                className="ui-pagestext"
                content="Shares a deep link that a user can use to navigate back to a specific state in this page. Please note that this method does yet work on mobile hosts."
              />
            </Fluent.Flex>
            <Fluent.Flex space="between">
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
            </Fluent.Flex>
          </Fluent.Segment>
        )}
      </>
    );
  }
  // return's  if capability is not supported.
  return <>Capability is not initialized</>;
};
