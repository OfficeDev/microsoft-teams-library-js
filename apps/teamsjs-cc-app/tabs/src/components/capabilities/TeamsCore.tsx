import { Button, Flex, TextArea } from "@fluentui/react-northstar";
import { app, teamsCore } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";
import { useState } from "react";

/**
 * This component enable print capability to support printing page using 
 * Ctrl+P and cmd+P and opens a default print page 
 */
export const TeamsCore = () => {
    const [text, setText] = useState("");
    const [showText, setShowText] = useState(false);
    // Check to see if capability is isInitialized
    if (app.isInitialized()) {
        // check to see if capability is supported
        if (teamsCore.isSupported()) {
            // register a handler for page unload event
            teamsCore.registerBeforeUnloadHandler(() => {
                console.log("BeforeUnloadHandler");
                return false;
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
        } else {
            // return's if capability is not supported
            return (<>Capability is not supported</>);
        }
    }
    // return's if capability is not initialized.
    return (<>Capability is not initialized</>);
}

export const TeamsCoreIsSupported = () => booleanToString(teamsCore.isSupported());
