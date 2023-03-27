import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { dialog } from "@microsoft/teams-js";

/**
 * This component Open's a dialog with an adaptive card
 */
export const DialogAdaptiveCard = () => {
    // check to see if capability is supported
    if (dialog.adaptiveCard.isSupported()) {
        // return buttons to open dialog
        return (
            <Button onClick={() => {
                dialog.adaptiveCard.open({
                    card: "",
                    size: { height: 400, width: 400 },
                    title: "Dialog Adaptive Card"
                },
                    (response) => {
                        console.log(response);
                    })
            }}>
                Open Dialog Adaptive Card
            </Button>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const DialogAdaptiveCardIsSupported = () => booleanToString(dialog.adaptiveCard.isSupported());

