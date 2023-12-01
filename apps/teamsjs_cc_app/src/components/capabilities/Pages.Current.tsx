import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, pages } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns a button which navigates to particular tab
 * with pageId or to a default page.
 */
export const PagesCurrentApp = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (pages.isSupported()) {
      if (pages.currentApp.isSupported()) {
        return (
          <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
            <Tooltip content="pages.currentApp.navigateTo()" trigger={
              <Button
                onClick={async () => {
                  await pages.currentApp.navigateTo({
                    pageId: "pagesTab",
                  });
                }}
              >
                Navigate Current App (PagesTab)
              </Button>
            } />
          </Flex>
        );
      }
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
