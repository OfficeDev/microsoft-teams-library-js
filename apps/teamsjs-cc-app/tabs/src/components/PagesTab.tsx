import { NavigateBack } from "./capabilities/pages/NavigateBack";
import { NavigateToApp } from "./capabilities/pages/NavigateToApp";
import { ReturnFocusToAppBar } from "./capabilities/pages/ReturnFocusToAppBar";
import { ReturnFocusToSearchBar } from "./capabilities/pages/ReturnFocusToSearchBar";
import { SetCurrentFrame } from "./capabilities/pages/SetCurrentFrame";
import { ShareDeepLink } from "./capabilities/pages/ShareDeepLink";
import { TeamsFxContext } from "./Context";
import { useContext } from "react";

/**
 * This component contains all the supported pages capability.
 */
const PagesTab = () => {
  const { themeString } = useContext(TeamsFxContext);

  return (
    <div className={themeString === "default" ? "" : "dark"}>
      <NavigateBack />
      <NavigateToApp />
      <ReturnFocusToAppBar />
      <ReturnFocusToSearchBar />
      <SetCurrentFrame />
      <ShareDeepLink />
    </div>
  );
};

export default PagesTab;
