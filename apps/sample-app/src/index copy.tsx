import './index.css';

import { FluentProvider, teamsDarkTheme, teamsLightTheme } from '@fluentui/react-components';
import { app } from '@microsoft/teams-js';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import App from './App';

// eslint-disable-next-line react-hooks/rules-of-hooks
const [context, setContext] = useState<app.Context>();

// eslint-disable-next-line react-hooks/rules-of-hooks
React.useEffect(() => {
  (async () => {
    try {
      await app.initialize();
      app.notifyAppLoaded();
      app.notifySuccess();
      const ctx = await app.getContext();
      setContext(ctx);
    } catch (e) {
      console.error(e);
    }
  })();
}, [setContext]);

if (context?.app.host.name == 'Teams') {
  if (context.app.theme == 'default') {
    ReactDOM.render(
      <FluentProvider theme={teamsLightTheme}>
        <App />,
      </FluentProvider>,
      document.getElementById('root'),
    );
  } else {
    ReactDOM.render(
      <FluentProvider theme={teamsDarkTheme}>
        <App />,
      </FluentProvider>,
      document.getElementById('root'),
    );
  }
} else {
  ReactDOM.render(
    <FluentProvider theme={teamsDarkTheme}>
      <App />,
    </FluentProvider>,
    document.getElementById('root'),
  );
}
