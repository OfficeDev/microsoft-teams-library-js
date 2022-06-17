import './index.css';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import React from 'react';
import ReactDOM from 'react-dom';

import App0 from './App0';
import { msalConfig } from './components/authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App0 />
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
