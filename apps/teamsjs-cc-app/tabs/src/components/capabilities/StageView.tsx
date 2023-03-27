import { developersPortalAppId, developersPortalThreadId } from "../../helpers/constants";

import { Button } from "@fluentui/react-northstar";
import { booleanToString } from "../../helpers";
import { stageView } from "@microsoft/teams-js";

/**
 * This component open Developer Portal app in stage view
 */
export const StageView = () => {
    // check to see if capability is supported
    if (stageView.isSupported()) {
        return (
            <Button onClick={async () => {
                // open Developer Portal app in stage view
                await stageView.open({
                    appId: developersPortalAppId,
                    contentUrl: 'https://dev.teams.microsoft.com/home?host=teams',
                    threadId: developersPortalThreadId,
                    title: 'Developer Portal'
                })
            }}>
                Open Stage View
            </Button>
        )
    };
    // return's  if capability is not supported.
    return (<>Capability is not supported</>);
}

export const StageViewIsSupported = () => booleanToString(stageView.isSupported());
