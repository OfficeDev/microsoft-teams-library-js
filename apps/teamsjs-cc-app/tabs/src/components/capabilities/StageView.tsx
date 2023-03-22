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
                    appId: "14072831-8a2a-4f76-9294-057bf0b42a68",
                    contentUrl: 'https://dev.teams.microsoft.com/home?host=teams',
                    threadId: '28:0c5cfdbb-596f-4d39-b557-5d9516c94107',
                    title: 'Developer Portal'
                })
            }}>
                Open Stage View
            </Button>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const StageViewIsSupported = () => booleanToString(stageView.isSupported());
