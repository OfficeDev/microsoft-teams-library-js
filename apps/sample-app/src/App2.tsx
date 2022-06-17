import { Provider, teamsDarkTheme, teamsHighContrastTheme, teamsTheme, ThemeInput } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { app } from '@microsoft/teams-js';
import React, { ReactElement, useEffect, useState } from 'react';

import { ButtonDefaultExample } from './components/Button';
import { DropdownBasicExample } from './components/Dropdown';
import NewButton from './components/NewButton';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const App2 = (): ReactElement => {
  const [appContext, setAppContext] = useState<microsoftTeams.app.Context>();
  const [appAppearance, setAppAppearance] = useState<ThemeInput>(teamsDarkTheme);

  const [notifyLoadedRes, setNotifyLoadedRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  useEffect(() => {
    microsoftTeams.app.getContext().then(context => {
      setAppContext(context);
      setAppAppearance(initTeamsTheme(context.app.theme));
      microsoftTeams.app.notifySuccess();
    });

    microsoftTeams.app.registerOnThemeChangeHandler(theme => {
      setAppAppearance(initTeamsTheme(theme));
    });
  }, []);

  const notifyLoaded = (): void => {
    app.notifyAppLoaded();
    setNotifyLoadedRes('called');
  };

  const notifySuccess = (): void => {
    app.notifySuccess();
    setNotifySuccessRes('called');
  };
  return (
    <Provider theme={appAppearance}>
      <div className="App">
        <h1 className="App-header"> Trial App 1-3 </h1>
        <DropdownBasicExample />
        <div className="Button">
          <p> Trial FluentUI Button</p>
          <ButtonDefaultExample />
        </div>
        <p>{JSON.stringify(appContext)}</p>
        <h1>{JSON.stringify(appContext?.app.sessionId)} </h1>
        <NewButton
          handleClick={notifyLoaded}
          output={notifyLoadedRes}
          title="appInitialization.appLoaded"
          name="appInitializationAppLoaded"
        />
        <br />
        <NewButton
          handleClick={notifySuccess}
          output={notifySuccessRes}
          title="appInitialization.success"
          name="appInitializationSuccess"
        />
      </div>
    </Provider>
  );
};

export default App2;

// Possible values for theme: 'default', 'light', 'dark' and 'contrast'
function initTeamsTheme(theme: string | undefined): ThemeInput {
  switch (theme) {
    case 'dark':
      return teamsDarkTheme;
    case 'contrast':
      return teamsHighContrastTheme;
    default:
      return teamsTheme;
  }
}
