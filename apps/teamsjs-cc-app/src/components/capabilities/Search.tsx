import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, search } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

export const Search = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (search.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="search.registerHandlers()" trigger={
            <Button
              onClick={() => {
                // register search handlers
                search.registerHandlers(
                  (searchText) => {
                    // This handler will be called when the user exits or cancels their search
                    console.log("onClosedHandler", searchText);
                  },
                  (searchText) => {
                    // The handler will be called when the user executes their search (by pressing Enter for example)
                    console.log("onExecuteHandler", searchText);
                  },
                  (searchText) => {
                    //This optional handler will be called when the user first starts using the host's search box and as the user types their query
                    console.log("onChangeHandler", searchText);
                  }
                );
              }}
            >
              Register Handlers
            </Button>
          } />
          <Tooltip content="search.unregisterHandlers()" trigger={
            <Button
              onClick={() => {
                // unregister search handlers
                search.unregisterHandlers();
              }}
            >
              Unregister Handlers
            </Button>
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
