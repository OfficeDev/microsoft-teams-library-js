import { Button, Flex, TextArea } from "@fluentui/react-northstar";

import { app } from "@microsoft/teams-js";
import { booleanToString } from "../../helpers";
import { useState } from "react";

/**
 * This component return button to get context and displays the 
 * information/ context in the resizeable text area
 */
export const App = () => {
    const [text, setText] = useState("");
    const [showText, setShowText] = useState(false);
    // check to see if app has been initialized
    if (app.isInitialized()) {
        app.registerOnThemeChangeHandler(() => {
            console.log("Theme changed");
        });

        return (
            <Flex gap="gap.small" vAlign="center">
                <Button className="ui_context" onClick={async () => {
                    const context = await app.getContext();
                    const contextString = JSON.stringify(context);
                    setText(contextString);
                    setShowText(true);
                    console.log(context);
                }}> Get Context
                </Button>
                {showText &&
                    <TextArea fluid inverted value={text} />}
            </Flex>
        )
    }
    // return empty fragment if app has not been initialized
    return (<></>);
}

export const AppIsSupported = () => booleanToString(true);
