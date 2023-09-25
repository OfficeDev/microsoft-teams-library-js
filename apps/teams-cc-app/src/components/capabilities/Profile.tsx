import { Flex, Text } from "@fluentui/react-northstar";
import { app, profile } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { booleanToString } from "../../helpers/convert";
import { isMobile } from "react-device-detect";

/**
 * This component is coming soon
 */
export const Profile = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (profile.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Text content="Coming Soon" />;
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};

export const ProfileIsSupported = () => booleanToString(profile.isSupported());
