import { Button, Flex, Input, Tooltip } from "@fluentui/react-northstar";
import { app, clipboard } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { isMobile } from "react-device-detect";
import { useState } from "react";

/**
 * This component returns button 
 */
export const Clipboard = () => {
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);

  const selection = () => {
    if (document.getSelection)
      return document.getSelection();
  }
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // Check to see if capability is supported
    if (clipboard.isSupported()) {
      return (
        <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
          <Tooltip content="API: clipboard.write() FrameContexts: content, meetingStage, task, settings, stage, sidePanel" trigger={
            <Button
              onClick={async () => {
                try {
                  const obj = selection ? selection()?.toString() : "Hello from clipboard";
                  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'text/plain' });
                  await clipboard.write(blob);
                  // const copiedText = (await blob.text()).replaceAll('"', '');
                  setText(`Text saved to Clipboard successfully`);
                  setShowText(true);
                } catch (error) {
                  alert(error);
                }
              }}
            >
              Clipboard Write
            </Button>
          } />
          <Tooltip content="API: clipboard.read() FrameContexts: content, meetingStage, task, settings, stage, sidePanel" trigger={
            <Button
              onClick={async () => {
                const blob = await clipboard.read();
                const copiedText = (await blob.text()).replaceAll('"', '');
                //alert(JSON.stringify(await blob.text(), null, 2))
                setText(copiedText);
                setShowText(true);
              }}
            >
              Clipboard Read
            </Button>
          } />
          {showText && (<Input value={text} />)}
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
