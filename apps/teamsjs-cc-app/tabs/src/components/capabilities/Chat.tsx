import { Button, Flex } from "@fluentui/react-northstar";
import { app, chat } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";

/**
 * This component returns button to start 1:1 and group chat
 */
export const Chat = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // Check to see if capability is supported
    if (chat.isSupported()) {
      return (
        <Flex gap="gap.small" vAlign="center">
          <Button
            onClick={async () => {
              await chat.openChat({
                user: "AdeleV@6plbfs.onmicrosoft.com",
                message: "This is the first message you are sending to AdeleV",
              });
            }}
          >
            Start Chat
          </Button>
          <Button
            onClick={async () =>
              await chat.openGroupChat({
                users: [
                  "AdeleV@6plbfs.onmicrosoft.com",
                  "AlexW@6plbfs.onmicrosoft.com",
                ],
                message:
                  "This is the first message you are sending to Group Chat",
                topic: "Group Chat",
              })
            }
          >
            Start Group Chat
          </Button>
        </Flex>
      );
    } else {
      // return's  if capability is not supported.
      return <>Capability is not supported</>;
    }
  }
  // return's  if capability is not initialized.
  return <>Capability is not initialized</>;
};

export const ChatIsSupported = () => booleanToString(chat.isSupported());
