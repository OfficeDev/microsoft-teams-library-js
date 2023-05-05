import { app, barCode } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

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
        <>
          <Button
            onClick={async () => {
              await barCode.hasPermission();
            }}
          >
            Bar code has permission
          </Button>
          <Button
            onClick={async () => {
              await barCode.requestPermission();
            }}
          >
            Bar code requests permission
          </Button>
          <Button
            onClick={async () => {
              const scanString = await barCode.scanBarCode({
                timeOutIntervalInSec: 30000,
              });
              console.log("Scan string", scanString);
            }}
          >
            Scan Bar Code
          </Button>
        </>
      );
    }
  }
  // return's if capability is not supported
  return <>Capability is not supported</>;
};

export const BarCodeIsSupported = () => booleanToString(barCode.isSupported());
