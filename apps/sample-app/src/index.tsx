import './index.css';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import AuthApp from './AuthApp';
import { msalConfig } from './components/authConfig';
const msalInstance = new PublicClientApplication(msalConfig);

const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const isAuth = params.has('auth') && params.get('auth') === '1';

if (isAuth) {
  ReactDOM.render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <AuthApp />
      </MsalProvider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
} else {
  ReactDOM.render(
    <React.StrictMode>
      <FluentProvider theme={teamsLightTheme}>
        <App />
      </FluentProvider>
    </React.StrictMode>,
    document.getElementById('root'),
  );
}
