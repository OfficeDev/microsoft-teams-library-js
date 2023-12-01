import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, barCode } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component returns button to scan barcode
 */
export const BarCode = () => {
  // Check if app is initialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (barCode.isSupported()) {
      // return button to scan barcode
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="barCode.hasPermission()" trigger={<Button
            onClick={async () => {
              await barCode.hasPermission();
            }}
          >
            Bar code has permission
          </Button>
          } />
          <Tooltip content="barCode.requestPermission()" trigger={
            <Button
              onClick={async () => {
                await barCode.requestPermission();
              }}
            >
              Bar code requests permission
            </Button>
          } />

          <Tooltip content="barCode.scanBarCode()" trigger={
            <Button
              onClick={async () => {
                const scanString = await barCode.scanBarCode({
                  timeOutIntervalInSec: 30000,
                });
                console.log("Scan string", scanString);
              }}
            >
              Scan Bar Code
            </Button>} />
        </Flex>
      );
    } else {
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  return <>{CapabilityStatus.NotInitialized}</>;
};