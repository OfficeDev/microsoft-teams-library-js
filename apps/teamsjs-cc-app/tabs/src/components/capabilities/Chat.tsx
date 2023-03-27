import { Button, Flex } from "@fluentui/react-northstar";

import { booleanToString } from "../../helpers";
import { chat } from "@microsoft/teams-js";

/**
 * This component returns button to start 1:1 and group chat
 */
export const Chat = () => {
    // check to see if capability is supported
    if (chat.isSupported()) {
        return (
            <Flex gap="gap.small" vAlign="center">
                <Button onClick={async () => {
                    await chat.openChat({
                        user: 'AdeleV@6plbfs.onmicrosoft.com',
                        message: "This is the first message you are sending to AdeleV"
                    })
                }}>
                    Start Chat
                </Button>
                <Button onClick={async () =>
                    await chat.openGroupChat({
                        users: [
                            'AdeleV@6plbfs.onmicrosoft.com',
                            'AlexW@6plbfs.onmicrosoft.com'
                        ],
                        message: "This is the first message you are sending to Group Chat",
                        topic: "Group Chat"
                    })}>
                    Start Group Chat
                </Button>
            </Flex>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const ChatIsSupported = () => booleanToString(chat.isSupported());
