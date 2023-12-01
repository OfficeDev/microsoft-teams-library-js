import { Button, Dropdown, Flex, Tooltip } from "@fluentui/react-northstar";
import { CapabilityStatus, userList } from "../../helpers/constants";
import { app, chat } from "@microsoft/teams-js";

import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component returns button to start 1:1 and group chat
 */
export const Chat = () => {
  const [users, setUsers] = useState([] as string[]);
  const [user, setUser] = useState("");

  const getA11ySelectionMessage = {
    onAdd: (user: any) => {
      const allusers = [...users, user];
      setUsers(allusers);
      return `${user} selected. Press left or right arrow keys to navigate selected items.`
    },
    onRemove: (item: any) => {
      const allusers = users.filter(x => x !== item);
      setUsers(allusers);
      return `${item} has been removed.`
    }
  }

  const onSelect = (element: any) => {
    const value = element.target.value ? element.target.value : "";
    setUser(value);
  }
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // Check to see if capability is supported
    if (chat.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Dropdown
            search
            items={userList}
            placeholder="Start typing a name or select"
            onSelect={onSelect}
          />
          <Tooltip content="chat.openChat()" trigger={
            <Button
              onClick={async () => {
                await chat.openChat({
                  user: user,
                  message: `This is the first message you are sending ${user}`,
                });
              }}
            >
              Start Chat
            </Button>
          } />
          <Dropdown
            search
            multiple
            items={userList}
            getA11ySelectionMessage={getA11ySelectionMessage}
            placeholder="Start typing a name or select"
          />
          <Tooltip content="chat.openGroupChat()" trigger={
            <Button
              onClick={async () =>
                await chat.openGroupChat({
                  users: users,
                  message: "This is the first message you are sending to Group Chat",
                  topic: "Group Chat",
                })
              }
            >
              Start Group Chat
            </Button>
          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported.
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
