import { Text } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { video } from "@microsoft/teams-js";

/**
 * This component is comming soon
 */
export const Video = () => {
    // check to see if capability is supported
    if (video.isSupported()) {
        return (
            <Text content="Coming Soon" />
        )
    };
    // return's  if capability is not supported
    return (<>Capability is not supported</>);
}

export const VideoIsSupported = () => booleanToString(video.isSupported());
