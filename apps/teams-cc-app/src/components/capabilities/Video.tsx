import { Button, Flex, Tooltip } from "@fluentui/react-northstar";
import { app, video } from "@microsoft/teams-js";

import { CapabilityStatus } from "../../helpers/constants";
import { booleanToString } from "../../helpers/convert";
import { isMobile } from "react-device-detect";

/**
 * This component is coming soon
 */
export const Video = () => {
  // Check to see if capability is isInitialized
  if (app.isInitialized()) {
    // check to see if capability is supported
    if (video.isSupported()) {
      //video.notifySelectedVideoEffectChanged(0, "");
      return (<Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">
        <Tooltip content="video.registerForVideoFrame()" trigger={
          <Button onClick={() => {
            video.registerForVideoFrame({
              videoBufferHandler: (e) => {
                console.log(e)
              }, videoFrameHandler: async (receivedVideoFrame: video.VideoFrameData) => { return receivedVideoFrame.videoFrame }, config: { format: video.VideoFrameFormat.NV12 }
            })
          }}>
            RegisterForVideoFrame
          </Button>
        } />
        <Tooltip content="video.notifySelectedVideoEffectChanged()" trigger={
          <Button onClick={() => {
            video.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, "");
          }}>
            NotifySelectedVideoEffectChanged
          </Button>
        } />
        <Tooltip content="video.registerForVideoEffect()" trigger={
          <Button onClick={() => {
            video.registerForVideoEffect(async (e) => {
              console.log(e);
            });
          }}>
            RegisterForVideoEffect
          </Button>
        } />
      </Flex>);
    } else {
      // return's if capability is not supported
      return <Flex gap="gap.small" className={isMobile ? "ui_flex_button_mobile" : ""} vAlign="center">{CapabilityStatus.NotSupported}</Flex>;
    }
  }
  // return's if App is not initialized.
  return <>{CapabilityStatus.NotInitialized}</>;
};

export const VideoIsSupported = () => booleanToString(video.isSupported());
