import { Button, Flex } from "@fluentui/react-northstar";
import { app, people } from "@microsoft/teams-js";

import { booleanToString } from "../../helpers";

/**
 * This component open's a dialog with search option to search
 * people in same organization.
 */
export const People = () => {
    // check to see if capability is supported
    if (people.isSupported()) {
        return (
            <Flex gap="gap.small" vAlign="center">
                <Button onClick={async () => {
                    try {
                        const picked = await people.selectPeople();
                        console.log(picked);
                    } catch {
                        console.log("User aborted");
                    }
                }}>
                    Open People Picker (Defaults)
                </Button>
                <Button onClick={async () => {
                    try {
                        const picked = await people.selectPeople({ singleSelect: true });
                        console.log(picked);
                    } catch {
                        console.log("User aborted");
                    }
                }}>
                    Open People Picker (Single)
                </Button>
                <Button onClick={async () => {
                    try {
                        const { user } = await app.getContext();
                        if (!user?.id) { throw new Error("No user ID"); }
                        const picked = await people.selectPeople({
                            setSelected: [user.id]
                        });
                        console.log(picked);
                    } catch {
                        console.log("User aborted");
                    }
                }}>
                    Open People Picker (Preselected)
                </Button>
                <Button onClick={async () => {
                    try {
                        const picked = await people.selectPeople({
                            openOrgWideSearchInChatOrChannel: false
                        });
                        console.log(picked);
                    } catch {
                        console.log("User aborted");
                    }
                }}>
                    Open People Picker (Members Only)
                </Button>
                <Button onClick={async () => {
                    try {
                        const picked = await people.selectPeople({
                            title: 'Custom Title'
                        });
                        console.log(picked);
                    } catch {
                        console.log("User aborted");
                    }
                }}>
                    Open People Picker (Custom Title)
                </Button>
            </Flex>
        )
    };
    // return empty fragment if capability is not supported
    return (<></>);
}

export const PeopleIsSupported = () => booleanToString(people.isSupported());
