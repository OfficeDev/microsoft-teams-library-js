import React, { useState, useEffect } from 'react';
import './Scenario1.css';
import { captureConsoleLogs } from './LoggerUtility';
import { app } from '@microsoft/teams-js';
import { registerOnResume } from '../../apis/AppApi';
import { authenticateUser } from '../../apis/AuthenticationStart';
//import appInstallDialogAPIs from './ApiComponents';
import { ApiComponent } from './ApiComponents';
import apiComponents from './ApiComponents';
import { ApiWithTextInput } from '../../utils/ApiWithTextInput';
import { ApiWithCheckboxInput } from '../../utils/ApiWithCheckboxInput';
import { ApiWithoutInput } from '../../utils/ApiWithoutInput';

type Log = string;

interface Scenario1Props {
  showFunction?: boolean;
}

export function Scenario1({ showFunction }: Scenario1Props) {
  const [logStatements, setLogStatements] = useState<Log[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const filteredLogs: Log[] = [];
    captureConsoleLogs((log: string) => {
      if (!log.includes('Get basic user info from SSO token')) {
        filteredLogs.push(log);
        setLogStatements([...filteredLogs]);
        localStorage.setItem('logStatements', JSON.stringify(filteredLogs));
      }
    });

    app.initialize();
  }, []);

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

  useEffect(() => {
    const storedLogs = localStorage.getItem('logStatements');
    if (storedLogs) {
      setLogStatements(JSON.parse(storedLogs));
    }
  }, []);

  const generateVerticalBoxes = () => {
    const filteredApis: ApiComponent[] = apiComponents.filter(api =>
      api.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return filteredApis.map((api: ApiComponent, index: number) => (
      <div key={index} className="vertical-box">
        <div className="api-container">
          <div className="api-header">{api.title}</div>
          <div className="dropdown-menu">
            <label htmlFor={`select-${index}`} className="sr-only">
              Select an option for {api.title}
            </label>
            <select id={`select-${index}`} className="box-dropdown">
              {api.options.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {api.inputType === 'text' && (
            <ApiWithTextInput
              title={api.title}
              name={api.name}
              onClick={api.onClick}
              defaultInput={api.defaultInput}
            />
          )}
          {api.inputType === 'checkbox' && (
            <ApiWithCheckboxInput
              title={api.title}
              name={api.name}
              onClick={api.onClick}
              defaultCheckboxState={api.defaultCheckboxState || false}
              label={api.label || ''}
            />
          )}
          {api.inputType === 'none' && (
            <ApiWithoutInput
              title={api.title}
              name={api.name}
              onClick={api.onClick}
            />
          )}
        </div>
      </div>
    ));
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
              {generateVerticalBoxes()}
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
