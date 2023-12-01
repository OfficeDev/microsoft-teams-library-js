import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, clipboard } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns button 
 */
export const Clipboard = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // Check to see if capability is supported
    if (clipboard.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="clipboard.read()" trigger={
            <Button
              onClick={async () => {
                await clipboard.read();
              }}
            >
              Clipboard Read
            </Button>
          } />
          <Tooltip content="clipboard.write()" trigger={
            <Button
              onClick={async () => {
                try {
                  const obj = "Hello from clipboard";
                  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'text/plain' });
                  await clipboard.write(blob);
                } catch (error) {
                  alert(error);
                }
              }}
            >
              Clipboard Write
            </Button>
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
