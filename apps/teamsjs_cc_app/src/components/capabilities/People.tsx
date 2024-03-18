import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, people } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";

/**
 * This component open's a dialog with search option to search
 * people in same organization.
 */
export const People = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (people.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="API: people.selectPeople() FrameContexts: content, task, settings" trigger={
            <Button
              onClick={async () => {
                try {
                  const picked = await people.selectPeople();
                  console.log(picked);
                } catch {
                  console.log("User aborted");
                }
              }}
            >
              People Picker (Defaults)
            </Button>
          } />
          <Tooltip content="API: people.selectPeople({singleSelect: true,}) FrameContexts: content, task, settings" trigger={
            <Button
              onClick={async () => {
                try {
                  const picked = await people.selectPeople({
                    singleSelect: true,
                  });
                  console.log(picked);
                } catch {
                  console.log("User aborted");
                }
              }}
            >
              People Picker (Single)
            </Button>
          } />
          <Tooltip content="API: people.selectPeople({setSelected: [user]}) FrameContexts: content, task, settings" trigger={
            <Button
              onClick={async () => {
                try {
                  const context = (await app.getContext()) as app.Context;
                  if (context.user && !context.user.id) {
                    throw new Error("No user ID");
                  }
                  const picked = await people.selectPeople({
                    setSelected: [context.user ? context.user.id : ""],
                  });
                  console.log(picked);
                } catch {
                  console.log("User aborted");
                }
              }}
            >
              People Picker (Preselected)
            </Button>
          } />
          <Tooltip content="API: people.selectPeople({ openOrgWideSearchInChatOrChannel: false}) FrameContexts: content, task, settings" trigger={
            <Button
              onClick={async () => {
                try {
                  const picked = await people.selectPeople({ openOrgWideSearchInChatOrChannel: true });
                  console.log(picked);
                } catch {
                  console.log("User aborted");
                }
              }}
            >
              People Picker (Members Only)
            </Button>
          } />
          <Tooltip content="API: people.selectPeople({title: `Custom Title`}) FrameContexts: content, task, settings" trigger={
            <Button
              onClick={async () => {
                try {
                  const picked = await people.selectPeople({
                    title: "Custom Title",
                  });
                  console.log(picked);
                } catch {
                  console.log("User aborted");
                }
              }}
            >
              People Picker (Custom Title)
            </Button>

          } />
        </Flex>
      );
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};
