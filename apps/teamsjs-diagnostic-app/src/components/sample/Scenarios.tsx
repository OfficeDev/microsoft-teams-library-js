import React from 'react';
import AppInitialization from './AppInitializationScenario';
import CustomScenario from './CustomScenario';
import LogConsole from './LogConsole';
import './Scenarios.css';

interface ScenariosProps {
  showFunction?: boolean;
}

const Scenarios: React.FC<ScenariosProps> = ({ showFunction }) => {
  return (
    <div className="scenarios-container">
      <div className="scenarios-row">
        <div className="scenario-column">
          <AppInitialization />
        </div>
        <div className="scenario-column">
          <div className="custom-and-apis-container">
            <CustomScenario />
          </div>
        </div>
    </div>
      <LogConsole initialLogs={[]} />
    </div>
  );
};

export default Scenarios;
