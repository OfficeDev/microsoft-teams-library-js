import { Button, Flex } from "@fluentui/react-northstar";
import { app, search } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";

export const Search = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (search.isSupported()) {
      return (
        <Flex gap="gap.small" vAlign="center">
          <Button
            onClick={async () => {
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
          <Button
            onClick={async () => {
              // unregister search handlers
              search.unregisterHandlers();
            }}
          >
            Unregister Handlers
          </Button>
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <>Capability is not supported</>;
    }
  }
  // return's if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const SearchIsSupported = () => booleanToString(search.isSupported());
