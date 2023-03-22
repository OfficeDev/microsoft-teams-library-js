import "./App.css";

// https://fluentsite.z22.web.core.windows.net/quick-start
import { Loader, Provider, teamsTheme } from "@fluentui/react-northstar";
import { Redirect, Route, HashRouter as Router } from "react-router-dom";

import DialogPage from "./DialogPage";
import PagesTab from "./PagesTab";
import Privacy from "./Privacy";
import Tab from "./Tab";
import TabConfig from "./TabConfig";
import { TeamsFxContext } from "./Context";
import TermsOfUse from "./TermsOfUse";
import { useTeamsFx } from "@microsoft/teamsfx-react";

/**
 * The main app which handles the initialization and routing
 * of the app.
 */
const App = () => {
  const { loading, theme, themeString, teamsfx } = useTeamsFx();

  return (
    <TeamsFxContext.Provider value={{ theme, themeString, teamsfx }}>
      <Provider theme={theme || teamsTheme} styles={{ backgroundColor: "#eeeeee" }}>
        <Router>
          <Route exact path="/">
            <Redirect to="/tab" />
          </Route>
          {loading ? (
            <Loader style={{ margin: 100 }} />
          ) : (
            <>
              <Route exact path="/privacy" component={Privacy} />
              <Route exact path="/termsofuse" component={TermsOfUse} />
              <Route exact path="/tab" component={Tab} />
              <Route exact path="/config" component={TabConfig} />
              <Route exact path="/dialog" component={DialogPage} />
              <Route exact path="/pagesTab" component={PagesTab} />
            </>
          )}
        </Router>
      </Provider>
    </TeamsFxContext.Provider>
  );
}

export default App;
