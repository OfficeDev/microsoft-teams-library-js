import { Button, Flex, TextArea, Tooltip } from "@fluentui/react-northstar";
import { app, geoLocation } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component check if the user has granted permission to access their location,
 * request permission to access the user's location and get the user's location.
 */
export const GeoLocation = () => {
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  // check to see if capability is supported
  // this isn't released yet, so it's not surprising that it doesn't work
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // Check to see if capability is supported
    if (geoLocation.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="geoLocation.hasPermission()" trigger={
            <Button
              onClick={async () => {
                // check if the user has granted permission to access their location
                const hasPerms = await geoLocation.hasPermission();
                setText(hasPerms ? "Have permission" : "Do not have permission");
                setShowText(true);
                console.log(`GeoLocation: ${hasPerms}`);
              }}
            >
              Has Permission
            </Button>
          } />
          <Tooltip content="geoLocation.requestPermission()" trigger={
            <Button
              onClick={async () => {
                try {
                  // request permission to access the user's location
                  const hasConsent = await geoLocation.requestPermission();
                  setText(hasConsent ? "Has Consent" : "Do not have Consent");
                  setShowText(true);
                  console.log(`GeoLocation consented: ${hasConsent}`);
                } catch (error) {
                  setText(JSON.stringify(error));
                }

              }}
            >
              Request Permission
            </Button>
          } />
          <Tooltip content="geoLocation.getCurrentLocation()" trigger={
            <Button
              onClick={async () => {
                // get the user's location
                try {
                  const location = await geoLocation.getCurrentLocation();
                  console.log(`GeoLocation consented: ${JSON.stringify(location, null, 2)}`);
                  const text = `GeoLocation consented: ${JSON.stringify(location, null, 2)}`;
                  setText(text);
                  setShowText(true);
                } catch (e) {
                  console.log(`GeoLocation error: ${e}`);
                }
              }}
            >
              Get Location
            </Button>
          } />
          {showText && (
            <TextArea className="ui_location" inverted value={text} />
          )}
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
