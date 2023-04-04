import { Flex, Text } from "@fluentui/react-northstar";
import { app, pages } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";

/**
 * The content of the pages capibility can be seen in pages tab
 * separately.
 */
export const Pages = () => {
  // check to see if capability is supported
  // see TabConfig.tsx for more details on pages.config namespace usage
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    if (!pages.isSupported()) {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }

    // check to see if app button is supported
    if (pages.appButton.isSupported()) {
      // register handler for hover over event
      pages.appButton.onHoverEnter(() => {
        console.log("onHoverEnter");
      });
      // register handler for hover out event
      pages.appButton.onHoverLeave(() => {
        console.log("onHoverLeave");
      });
      // register handler for click event
      pages.appButton.onClick(() => {
        console.log("onClick");
      });
    }

    // register handler for full screen event on a tab
    pages.registerFullScreenHandler(() => {
      console.log("fullScreenHandler");
    });

    return (
      <Flex gap="gap.small" vAlign="center">
        <Text content="Please check the Pages Tab" />
      </Flex>
    );
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const PagesIsSupported = () => booleanToString(pages.isSupported());
