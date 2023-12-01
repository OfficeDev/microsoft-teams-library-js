import { useContext, useState } from "react";

import { MeetingApi } from "./capabilities/meeting/MeetingApi";
import { TeamsFxContext } from "./Context";
import { app } from "@microsoft/teams-js";

/**
 * This component contains all the supported pages capability.
 */
const MeetingTab = () => {
    const { themeString } = useContext(TeamsFxContext);
    const [initialized, setInitialized] = useState(false);

    app.initialize().then(() => {
        app.notifySuccess();
        setInitialized(true);
    });

    if (initialized && app.isInitialized()) {
        return (
            <div className={themeString === "default" ? "" : "dark"}>
                <MeetingApi />
            </div>
        )
    }
    return <></>;
}

export default MeetingTab;