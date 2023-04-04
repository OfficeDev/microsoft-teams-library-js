import { app, monetization } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component is for monetizing purpose
 */
export const Monetization = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (monetization.isSupported()) {
      return (
        <>
          <Button
            onClick={async () => {
              // To use this provide plan id and term of plan
              await monetization.openPurchaseExperience({
                planId: "",
                term: "",
              });
            }}
          >
            Monetization OpenPurchaseExperience
          </Button>
        </>
      );
    } else {
      // return's if capability is not supported
      return <>Capability is not supported</>;
    }
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const MonetizationIsSupported = () =>
  booleanToString(monetization.isSupported());
