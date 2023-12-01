import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, geoLocation } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

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
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="geoLocation.map.chooseLocation()" trigger={
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
          } />
          <Tooltip content="geoLocation.getCurrentLocation() & geoLocation.map.showLocation()" trigger={
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
