import { Header, Segment } from "@fluentui/react-northstar";
import { useContext, useState } from "react";

import { NavigateBack } from "./capabilities/pagesSubCapability/NavigateBack";
import { NavigateToApp } from "./capabilities/pagesSubCapability/NavigateToApp";
import { NavigateToDefaultPage } from "./capabilities/pagesSubCapability/NavigateToDefaultPage";
import { ReturnFocusToAppBar } from "./capabilities/pagesSubCapability/ReturnFocusToAppBar";
import { ReturnFocusToSearchBar } from "./capabilities/pagesSubCapability/ReturnFocusToSearchBar";
import { SetCurrentFrame } from "./capabilities/pagesSubCapability/SetCurrentFrame";
import { ShareDeepLink } from "./capabilities/pagesSubCapability/ShareDeepLink";
import { TeamsFxContext } from "./Context";
import { app } from "@microsoft/teams-js";

/**
 * This component contains all the supported pages capability.
 */
const PagesTab = () => {
    const { themeString } = useContext(TeamsFxContext);
    const [initialized, setInitialized] = useState(false);

    app.initialize().then(() => {
        app.notifySuccess();
        setInitialized(true);
    });

    if (initialized && app.isInitialized()) {
        return (
            <div className={themeString === "default" ? "" : "dark"}>
                <NavigateBack />
                <NavigateToDefaultPage />
                <Segment>
                    <Header styles={{ margin: "unset" }} as="h2" content="Pages Capabilities " />
                </Segment>
                <NavigateToApp />
                <ReturnFocusToAppBar />
                <ReturnFocusToSearchBar />
                <SetCurrentFrame />
                <ShareDeepLink />
            </div>
        );
    }
    return null;
};

export default PagesTab;
