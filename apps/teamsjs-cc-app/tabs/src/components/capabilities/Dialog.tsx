import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { dialog } from "@microsoft/teams-js";

/**
 * This component Open's a dialog with a form and 
 * on submit it logs the json value in the console and closes the dialog
 */
export const Dialog = () => {
    // check to see if capability is supported
    if (dialog.isSupported()) {
        // return buttons to open dialog
        return (
            <Button onClick={() => {
                const baseUrl = `https://${window.location.hostname}:${window.location.port}`;

                dialog.url.open({
                    title: 'Dialog Example',
                    fallbackUrl: `${baseUrl}/index.html#/privacy`,
                    url: `${baseUrl}/index.html#/dialog`,
                    size: { height: 300, width: 500 }
                }, (response) => {
                    if (response.err) {
                        console.log(response.err);
                    }
                    console.log('submitHandler:', response.result);
                }, (res) => {
                    console.log('dialogListener', res);
                })
            }}>
                Open Dialog
                dialog.url.submit
            </Button>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const DialogUrlIsSupported = () => booleanToString(dialog.url.isSupported());
export const DialogAdaptivecardIsSupported = () => booleanToString(dialog.adaptiveCard.isSupported());

