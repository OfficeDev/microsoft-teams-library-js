import './index.css';

import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <FluentProvider theme={teamsDarkTheme}>
    <App />,
  </FluentProvider>,
  document.getElementById('root'),
);
