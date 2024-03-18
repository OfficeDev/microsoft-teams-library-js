import { Button, Dropdown, Flex, Tooltip } from "@fluentui/react-northstar";
import { CapabilityStatus, userList } from "../../helpers/constants";
import { app, call } from "@microsoft/teams-js";

import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component returns button to start a call.
 */
export const Call = () => {
  const [users, setUsers] = useState([] as string[]);
  const [context, setContext] = useState({} as app.Context);

  app.getContext().then(ctx => {
    setContext(ctx);
  });
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // Check to see if capability is supported
    if (call.isSupported()) {
      // return button to start a call
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Dropdown
            search
            items={userList}
            placeholder="Start typing a name or select"
            onSelect={(e: any) => {
              const loginDomain = context.user?.userPrincipalName?.split('@').at(1);
              const value = e.target.value ? e.target.value + '@' + loginDomain : "";
              setUsers([value]);
            }}
          />
          <Tooltip content={`API: call.startCall() FrameContexts:content, task`} trigger={
            <Button
              onClick={async () => {
                if (users.length > 0) {
                  await call.startCall({
                    targets: users,
                    requestedModalities: [
                      call.CallModalities.Audio,
                      call.CallModalities.Video,
                      call.CallModalities.VideoBasedScreenSharing,
                      call.CallModalities.Data,
                    ],
                  });
                } else { alert("Add user(s)") }
              }}
            >
              Start Call
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
