import { Flex, Text } from "@fluentui/react-northstar";
import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

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
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }

    // register handler for full screen event on a tab
    pages.registerFullScreenHandler(() => {
      console.log("fullScreenHandler");
    });

    return (
      <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
        <Text content="Please check the Pages Tab" />
      </Flex>
    );
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
