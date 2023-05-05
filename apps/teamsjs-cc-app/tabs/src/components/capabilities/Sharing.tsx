import { app, sharing } from "@microsoft/teams-js";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
/**
 * This component open's a dialog with shareable content
 */
export const Sharing = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (sharing.isSupported()) {
      return (
        <Button
          onClick={async () => {
            try {
              await sharing.shareWebContent({
                content: [
                  {
                    type: "URL",
                    url: "https://www.microsoft.com",
                    message: "Check out this link!",
                    preview: true,
                  },
                ],
              });
            } catch {
              console.log("User aborted");
            }
          }}
        >
          {" "}
          Share web content
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

export const SharingIsSupported = () => booleanToString(sharing.isSupported());
