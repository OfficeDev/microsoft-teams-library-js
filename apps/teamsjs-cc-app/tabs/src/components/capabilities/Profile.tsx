import { Text } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { profile } from "@microsoft/teams-js";

/**
 * This component is comming soon
 */
export const Profile = () => {
    // check to see if capability is supported
    if (profile.isSupported()) {
        return (
            <Text content="Coming Soon" />
        )
    };
    // return empty fragment if capability is not supported.
    return (<>Capability is not supported</>);
}

export const ProfileIsSupported = () => booleanToString(profile.isSupported());
