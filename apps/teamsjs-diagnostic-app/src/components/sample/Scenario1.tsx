import { useState, useEffect } from 'react';
import './Scenario1.css';
import { captureConsoleLogs } from './LoggerUtility';
import { app } from '@microsoft/teams-js';
import { registerOnResume } from '../../apis/AppApi';
import { authenticateUser } from '../../apis/AuthenticationStart';

type Log = string;

interface Scenario1Props {
  showFunction?: boolean;
}

export function Scenario1({ showFunction }: Scenario1Props) {
  const [logStatements, setLogStatements] = useState<Log[]>([]);

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

  const generateVerticalBoxes = (count: number) => {
    const options = ['Option 1', 'Option 2', 'Option 3'];
    const verticalBoxes = [];
    for (let i = 1; i <= count; i++) {
      verticalBoxes.push(
        <div key={i} className="vertical-box">
          <span className="box-title">
            {i}. API {i}
          </span>
          <label htmlFor={`select-${i}`} className="sr-only">
            Select an option for API {i}
          </label>
          <select id={`select-${i}`} className="box-dropdown">
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>,
      );
    }
    return verticalBoxes;
  };

  useEffect(() => {
    const storedLogs = localStorage.getItem('logStatements');
    if (storedLogs) {
      setLogStatements(JSON.parse(storedLogs));
    }
  }, []);

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
          <div className="all-api-box">{generateVerticalBoxes(12)}</div>
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
