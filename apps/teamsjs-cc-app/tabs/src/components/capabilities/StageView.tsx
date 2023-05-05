import { app, stageView } from "@microsoft/teams-js";
import {
  developersPortalAppId,
  developersPortalThreadId,
} from "../../helpers/constants";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";

/**
 * This component open Developer Portal app in stage view
 */
export const StageView = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (stageView.isSupported()) {
      return (
        <Button
          onClick={async () => {
            // open Developer Portal app in stage view
            await stageView.open({
              appId: developersPortalAppId,
              contentUrl: "https://dev.teams.microsoft.com/home?host=teams",
              threadId: developersPortalThreadId,
              title: "Developer Portal",
            });
          }}
        >
          Open Stage View
        </Button>
      );
    } else {
      // return's if capability is not supported
      return <>Capability is not supported</>;
    }
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const StageViewIsSupported = () =>
  booleanToString(stageView.isSupported());
