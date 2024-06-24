import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import './Scenario1.css';
import { app } from '@microsoft/teams-js';
import apiComponents, { ApiComponent } from './ApiComponents';
import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
import BarCodeAPIs from '../../apis/BarCodeApi';
import { captureConsoleLogs } from './LoggerUtility';
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
    captureConsoleLogs((log: string) => {
      setLogStatements((prevLogs) => {
        const updatedLogs = [...prevLogs, log];
        localStorage.setItem('logStatements', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    });
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

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'API',
    drop: (item: { api: ApiComponent, func: string, input?: string }) => addToScenario(item.api, item.func, item.input),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const generateVerticalBoxes = () => {
    const filteredApis = apiComponents.filter(api =>
      api.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredApis.map((api: ApiComponent, index: number) => (
      <div key={index} className="vertical-box">
        {api.title === 'App Install Dialog API' ? (
          <AppInstallDialogAPIs apiComponent={api} />
        ) : api.title === 'Bar Code API' ? (
          <BarCodeAPIs apiComponent={api} />
        ) : null}
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

        <div className="scenario2-container" ref={drop} style={{ backgroundColor: isOver ? 'lightgreen' : 'white' }}>
          <div className="scenario2-header">
            <h2>Custom Scenario</h2>
            <p>Drag and drop API components here to build your custom scenario.</p>
          </div>
          <div className="custom-scenario-box">
            <button className="scenario1-button" onClick={handleRunScenario}>Run Scenario</button>
            <div className="api-section">
              <div className="api-header">APIs Being Run:</div>
              <div className="vertical-box-container">
                {customScenario.map((item, index) => (
                  <div key={index} className="vertical-box">
                    <span className="box-title">{item.api.title}</span>
                    <span className="box-subtitle">{item.func}</span>
                    {item.input && <span className="box-input">Input: {item.input}</span>}
                  </div>
                ))}
              </div>
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
