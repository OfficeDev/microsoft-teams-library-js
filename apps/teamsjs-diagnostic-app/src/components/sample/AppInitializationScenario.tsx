import React, { useEffect, useState } from 'react';
import './AppInitializationScenario.css';
import { app } from '@microsoft/teams-js';
import { getContextV2, registerBeforeSuspendOrTerminateHandler, registerOnResume, registerOnThemeChangeHandlerV2 } from '../../apis/AppApi';
import { authenticateUser } from '../../apis/AuthenticationStart';

interface AppInitializationScenarioProps {
  showSuccessMessage?: boolean;
}

const AppInitializationScenario: React.FC<AppInitializationScenarioProps> = ({ showSuccessMessage = false }) => {
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    app.initialize();
  }, []);

  const runAppInitializationScenario = async () => {
    try {
      console.log('Running App Initialization Scenario...');
      await registerOnResume();
      await getContextV2();
      await registerOnThemeChangeHandlerV2();
      await registerBeforeSuspendOrTerminateHandler(3000);

      // Authenticate user
      console.log('Attempting to authenticate user...');
      const authSuccess = await authenticateUser();
      if (authSuccess) {
        console.log("User authenticated");
        console.log('App Initialization Scenario successfully completed');
        setSuccessMessage('App Initialization Scenario successfully completed');
      } else {
        console.log('User not authenticated');
        showSignInPopup();
      }
    } catch (error: any) {
      console.error(`App initialization scenario failed. ${error.message}`);
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
              <div className="vertical-box1">
                <span className="box-title">1. app</span>
              </div>
              <div className="vertical-box1">
                <span className="box-title">2. authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showSuccessMessage && successMessage && <div>{successMessage}</div>}
    </div>
  );
};

export default AppInitializationScenario;
