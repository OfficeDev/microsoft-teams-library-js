import React, { useState, useEffect } from 'react';
import './Scenario1.css';
import { captureConsoleLogs } from './LoggerUtility';
import { app } from '@microsoft/teams-js';

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

  useEffect(() => {
    const storedLogs = localStorage.getItem('logStatements');
    if (storedLogs) {
      setLogStatements(JSON.parse(storedLogs));
    }
  }, []);

  const generateVerticalBoxes = (numBoxes: number) => {
    const options = ['Option 1', 'Option 2', 'Option 3'];

    return (
      <div className="vertical-box-container">
        {Array.from({ length: numBoxes }, (_, index) => (
          <div key={index} className="vertical-box">
            <div className="api-container">
              <div className="api-header">API {index + 1}</div>
              <div className="dropdown-menu">
                <label htmlFor={`select-${index}`} className="sr-only">
                  Select an option for API {index + 1}
                </label>
                <select id={`select-${index}`} className="box-dropdown">
                  {options.map((option, optionIndex) => (
                    <option key={optionIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2>App Initialization Scenario</h2>
      <p>Click the button to run the app initialization scenario.</p>
      <div className="scenario-container">
        <div className="scenario1-box">
          <button className="scenario1-button" type="button" data-testid="run-scenario-button">
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
