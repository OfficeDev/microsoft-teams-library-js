import { app, profile } from "@microsoft/teams-js";

import { Text } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component is comming soon
 */
export const Profile = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (profile.isSupported()) {
      return <Text content="Coming Soon" />;
    } else {
      // return's if capability is not supported
      return <>Capability is not supported</>;
    }
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const ProfileIsSupported = () => booleanToString(profile.isSupported());
