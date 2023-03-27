import { Button, Flex, TextArea } from "@fluentui/react-northstar";

import { booleanToString } from "../../helpers";
import { teamsCore } from "@microsoft/teams-js";
import { useState } from "react";

/**
 * This component enable print capability to support printing page using 
 * Ctrl+P and cmd+P and opens a default print page 
 */
export const TeamsCore = () => {
    const [text, setText] = useState("");
    const [showText, setShowText] = useState(false);
    // check to see if capability is supported
    if (teamsCore.isSupported()) {
        // register a handler for page unload event
        teamsCore.registerBeforeUnloadHandler(() => {
            console.log("BeforeUnloadHandler");
            return true;
        });

        // register a handler for page unload event
        teamsCore.registerOnLoadHandler(() => {
            console.log("OnLoadHandler");
            return true;
        });

        return (
            <Flex gap="gap.small" vAlign="center">
                <Button onClick={() => {
                    teamsCore.enablePrintCapability();
                    setText("Use ctrl+p and cmd+p");
                    setShowText(true);

                }}>
                    Enable Print Capability
                </Button>
                <Button onClick={() => {
                    teamsCore.print();
                }}>
                    Print
                </Button>
                {showText &&
                    <TextArea className="ui_teamscore" value={text} />
                }
            </Flex>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const TeamsCoreIsSupported = () => booleanToString(teamsCore.isSupported());
