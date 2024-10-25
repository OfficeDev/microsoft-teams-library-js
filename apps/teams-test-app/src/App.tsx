import './App.css';

import { app, appInitialization, initialize } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { isTestBackCompat } from './components/utils/isTestBackCompat';
import { SecondRoute } from './pages/SecondRoute';
import { appInitializationTestQueryParameter, TestApp } from './pages/TestApp';

const urlParams = new URLSearchParams(window.location.search);

// The search url parameter 'origins' is used to get the valid message origins which will be passed to
// the initialize function and based on the hosts it will allow the origins or not.
// The valid message origins are separated by comma. For example: https://relecloud.com/?origins=https://relecoud.com,https://*.relecloud.com
const getOriginsParam = urlParams.has('origins') && urlParams.get('origins') ? urlParams.get('origins') : '';
const validMessageOrigins: string[] | undefined = getOriginsParam ? getOriginsParam.split(',') : undefined;

// This is added for custom initialization when app can be initialized based upon a trigger/click.
if (!urlParams.has('customInit') || !urlParams.get('customInit')) {
  if (isTestBackCompat()) {
    initialize(undefined, validMessageOrigins);
  } else {
    app.initialize(validMessageOrigins);
  }
}

// for AppInitialization tests we need a way to stop the Test App from sending these
// we do it by adding appInitializationTest=true to query string
if (
  (urlParams.has('customInit') && urlParams.get('customInit')) ||
  (urlParams.has(appInitializationTestQueryParameter) && urlParams.get(appInitializationTestQueryParameter))
) {
  window.addEventListener('message', handleMessageFromMockedHost);
  console.info('Not calling appInitialization because part of App Initialization Test run');
} else {
  if (isTestBackCompat()) {
    appInitialization.notifyAppLoaded();
    appInitialization.notifySuccess();
  } else {
    app.notifyAppLoaded();
    app.notifySuccess();
  }
}

function handleMessageFromMockedHost(msg: MessageEvent): void {
  if (!msg.data) {
    console.warn('Unrecognized message format received by app, message being ignored. Message: %o', msg);
    return;
  }
  console.log(`Received message from test host: ${JSON.stringify(msg.data)}`);
  // Handle messages that are correctly formatted and for func values we recognize
  switch (msg.data) {
    case 'app.initialize':
      app.initialize();
      break;
    case 'app.notifySuccess':
      app.notifySuccess();
      break;
    case 'app.notifyFailure':
      app.notifyFailure({ reason: app.FailedReason.Other, message: 'Failed on test app on purpose' });
      break;
    case 'app.notifyExpectedFailure':
      app.notifyExpectedFailure({ reason: app.ExpectedFailureReason.Other, message: 'Failed on test app on purpose' });
      break;
    case 'app.notifyAppLoaded':
      app.notifyAppLoaded();
      break;
    // Add more cases for other API calls as needed
    default:
      console.warn('Unknown API call or response:', msg);
  }
}

export const noHostSdkMsg = ' was called, but there was no response from the Host SDK.';

/**
 * Generates and returns an error message explaining that a string input was expected
 * to be parsed into a JSON object but there was a parsing error.
 * If there is an example JSON object provided, it gives the keys needed in a
 * correctly formatted JSON object parameter of the desired function. If possible,
 * it is recommended to provide this example to this function.
 *
 * @param [example] Example object of the type to generate the error message about.
 * @returns A message to the user to fix their input. Provides an example if there is any.
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const generateJsonParseErrorMsg = (example?: Record<string, any>): string => {
  if (example) {
    return `Please JSON format your input. Your input should contain at least ${Object.keys(
      example,
    )}. For example, ${JSON.stringify(example)}`;
  } else {
    return "Please JSON format your input. If you've ensured your input is JSON formatted but are still getting this message, please also ensure that your input contains all necessary keys, etc.";
  }
};

/**
 * Generates and returns a message for confirming registration attempt of a handler, callback, etc.
 * Takes in the trigger condition for the handler to provide in the message to the user.
 *
 * @param changeCause the trigger condition for the handler to fire.
 * @returns A message to user to show confirmation of handler registration attempt.
 */
export const generateRegistrationMsg = (changeCause: string): string => {
  return `Registration attempt has been initiated. If successful, this message will change when ${changeCause}.`;
};

// button to route to the second route
export const SecondRouteButton = (): ReactElement => (
  <a href="/second-route">
    <button>Go to Second Route</button>
  </a>
);

const App = (): ReactElement => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestApp />} />
          <Route path="/second-route" element={<SecondRoute />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
