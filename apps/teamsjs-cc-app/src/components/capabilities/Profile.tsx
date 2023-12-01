import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, profile } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
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
          <Tooltip content="profile.showProfile()" trigger={
            <Button onClick={async () => {
              const context = await app.getContext();
              await profile.showProfile({
                persona: {
                  identifiers: {
                    AadObjectId: context.user?.id,
                    Upn: context.user?.userPrincipalName
                  },
                  displayName: context.user?.displayName
                },
                targetElementBoundingRect: {
                  bottom: 300,
                  height: 300,
                  left: 300,
                  right: 300,
                  x: 300,
                  y: 300,
                  top: 300,
                  width: 300,
                  toJSON: () => {
                  }
                },
                triggerType: "MouseHover",
                modality: "Expanded"
              })
            }}>Profile ShowProfile</Button>
          } />
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
