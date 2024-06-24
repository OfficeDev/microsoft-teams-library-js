import React, { useState, useEffect } from 'react';
import './Scenario1.css';
import { app } from '@microsoft/teams-js';
import apiComponents, { ApiComponent } from './ApiComponents';
import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
import { ApiWithTextInput } from '../../utils/ApiWithTextInput';
import { ApiWithCheckboxInput } from '../../utils/ApiWithCheckboxInput';
import { ApiWithoutInput } from '../../utils/ApiWithoutInput';
import { registerOnResume } from '../../apis/AppApi';
import { authenticateUser } from '../../apis/AuthenticationStart';

type Log = string;

export interface Scenario1Props {
  showFunction?: boolean;
}

const Scenario1: React.FC<Scenario1Props> = ({ showFunction = true }) => {
  const [logStatements, setLogStatements] = useState<Log[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customScenario, setCustomScenario] = useState<Array<{ api: ApiComponent, func: string, input?: string }>>([]);

  useEffect(() => {
    app.initialize();
  }, []);

  useEffect(() => {
    const storedLogs = localStorage.getItem('logStatements');
    if (storedLogs) {
      setLogStatements(JSON.parse(storedLogs));
    }
  }, []);

  const handleRunScenario = async () => {
    console.log('Running custom scenario...');
    for (const { api, func, input } of customScenario) {
      console.log(`Executing ${func} for ${api.title} with input: ${input}`);
      // Execute the API function based on the selected function and input
    }
  };

  const addToScenario = (api: ApiComponent, func: string, input?: string) => {
    setCustomScenario([...customScenario, { api, func, input }]);
  };

  const generateVerticalBoxes = () => {
    const filteredApis = apiComponents.filter(api =>
      api.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredApis.map((api: ApiComponent, index: number) => (
      <div key={index} className="vertical-box">
        <AppInstallDialogAPIs apiComponent={api} addToScenario={addToScenario} />
      </div>
    ));
  };

  const runAppInitializationScenario = async () => {
    try {
      console.log('Running App Initialization Scenario...');
      console.log('Attempting to register on resume handler...');
      await registerOnResume();
      console.log('Attempting to authenticate user...');
      const authSuccess = await authenticateUser();
      if (authSuccess) {
        console.log('App Initialization Scenario successfully completed');
      } else {
        console.log('User not authenticated');
        showSignInPopup();
      }
    } catch (error: any) {
      console.log(`App initialization scenario failed. ${error.message}`);
    }
  };

  const showSignInPopup = () => {
    console.log('Showing sign-in popup...');
  };

  return (
    <div>
      <h2>App Initialization Scenario</h2>
      <p>Click the button to run the app initialization scenario.</p>
      <div className="scenario-container">
        <div className="scenario1-box">
          <button
            className="scenario1-button"
            onClick={runAppInitializationScenario}
            type="button"
            data-testid="run-scenario-button"
          >
            Run Scenario
          </button>
          <div className="api-section">
            <div className="api-header">APIs Being Run:</div>
            <div className="vertical-box-container">
              <div className="vertical-box">
                <span className="box-title">1. app</span>
              </div>
              <div className="vertical-box">
                <span className="box-title">2. authentication</span>
              </div>
            </div>
          </div>
        </div>

        <div className="scenario2-container">
          <div className="scenario2-header">
            <h2>Custom Scenario</h2>
            <p>Click the button to run your custom scenario.</p>
          </div>
          <div className="custom-scenario-box">
            <button className="scenario1-button">Run Scenario</button>
            <button className="set-scenario-button">+</button>
            <div className="api-section">
              <div className="api-header">APIs Being Run:</div>
            </div>
          </div>
        </div>

        <div className="all-api-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="all-api-box">{generateVerticalBoxes()}</div>
        </div>
      </div>

      <h2>Log Console</h2>
      <div className="horizontal-box">
        <div className="content">
          <div className="log-console">
            {logStatements.map((statement, index) => (
              <div key={index} className="log-statement">
                {statement}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scenario1;

