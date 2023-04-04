import { Button, Flex } from "@fluentui/react-northstar";
import { app, geoLocation } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";

/**
 * This component check if the user has granted permission to access their location,
 * request permission to access the user's location and get the user's location.
 */
export const GeoLocationMap = () => {
  // check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (geoLocation.map.isSupported()) {
      return (
        <Flex gap="gap.small" vAlign="center">
          <Button
            onClick={async () => {
              try {
                const location = await geoLocation.map.chooseLocation();
                console.log("Map: Choose Location", location);
              } catch (e) {
                console.log(`GeoLocation error: ${e}`);
              }
            }}
          >
            Map: Choose Location
          </Button>
          <Button
            onClick={async () => {
              try {
                const location = await geoLocation.getCurrentLocation();
                await geoLocation.map.showLocation(location);
              } catch (e) {
                console.log(`GeoLocation error: ${e}`);
              }
            }}
          >
            Map: Show Location
          </Button>
        </Flex>
      );
    } else {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }
  }
  // return's  if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const GeoLocationMapIsSupported = () =>
  booleanToString(geoLocation.map.isSupported());
