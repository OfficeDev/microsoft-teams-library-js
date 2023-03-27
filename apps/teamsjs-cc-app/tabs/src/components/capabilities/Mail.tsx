import { Button, Flex } from "@fluentui/react-northstar";

import { booleanToString } from "../../helpers";
import { mail } from "@microsoft/teams-js";
import { openMailItemId } from "../../helpers/constants";

/**
 * This component compose a new mail and open's an existing mail with mailItemId
 */
export const Mail = () => {
    // check to see if capability is supported
    if (mail.isSupported()) {
        return (
            <Flex gap="gap.small" vAlign="center">
                <Button onClick={async () => {
                    await mail.composeMail({
                        type: mail.ComposeMailType.New,
                        subject: "Here goes the mail subject ",
                        message: "This is the first mail you are about to send",
                        toRecipients: [
                            'AdeleV@6plbfs.onmicrosoft.com',
                            'AlexW@6plbfs.onmicrosoft.com'
                        ],
                    })
                }}>
                    Compose Mail
                </Button>
                <Button onClick={async () => {
                    await mail.openMailItem({
                        itemId: openMailItemId,
                    })
                }}>
                    Open Mail Item
                </Button>
            </Flex>
        )
    };
    // return's  if capability is not supported
    return (<>Capability is not supported</>);
}

export const MailIsSupported = () => booleanToString(mail.isSupported());
