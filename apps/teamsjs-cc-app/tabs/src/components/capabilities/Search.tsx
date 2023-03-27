import { Button, Flex } from "@fluentui/react-northstar";

import { booleanToString } from "../../helpers";
import { search } from "@microsoft/teams-js";

export const Search = () => {
    // check to see if capability is supported
    if (search.isSupported()) {
        // onClosed handler
        const onClosed = () => {
            console.log("This handler will be called when the user exits or cancels their search");
        };
        // onExecute handler
        const onExecute = () => {
            console.log("The handler will be called when the user executes their search (by pressing Enter for example)");
        };
        // onChange handler
        const onChange = () => {
            console.log(" This optional handler will be called when the user first starts using the host's search box and as the user types their query");
        };

        return (
            <Flex gap="gap.small" vAlign="center">
                <Button onClick={async () => {
                    // register search handlers
                    search.registerHandlers(onClosed, onExecute, onChange);
                }}>
                    Register Handlers
                </Button>
                <Button onClick={async () => {
                    // unregister search handlers
                    search.unregisterHandlers();
                }}>
                    Unregister Handlers
                </Button>
            </Flex>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const SearchIsSupported = () => booleanToString(search.isSupported());
