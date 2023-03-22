import { Button, Flex } from "@fluentui/react-northstar";
import { app, mail } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";

/**
 * This component compose a new mail and open's an existing mail with mailItemId
 */
export const Mail = () => {
    app.initialize();
    // check to see if capability is supported
    if (mail.isSupported()) {
        return (
            <Flex gap="gap.small" vAlign="center">
                <Button onClick={async () => {
                    mail.composeMail({
                        type: mail.ComposeMailType.New,
                        subject: "Hello",
                        message: "Hello World",
                        toRecipients: [
                            'AdeleV@6plbfs.onmicrosoft.com',
                            'AlexW@6plbfs.onmicrosoft.com'
                        ],
                    })
                }}>
                    Compose Mail
                </Button>
                <Button onClick={async () => {
                    mail.openMailItem({
                        itemId: '0',
                    })
                }}>
                    Open Mail Item
                </Button>
            </Flex>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const MailIsSupported = () => booleanToString(mail.isSupported());
