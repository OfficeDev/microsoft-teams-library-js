import React, { useState } from 'react';
import './CustomScenario.css'; // Import CSS file for CustomScenarios

import apiComponents from './ApiComponents';

const CustomScenario: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const generateVerticalBoxes = () => {
    const filteredApis = apiComponents.filter(api =>
      api.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const options = ['Option 1', 'Option 2', 'Option 3'];
    return filteredApis.map((api, index) => (
      <div key={index} className="vertical-box">
        <div className="api-container">
          <div className="api-header">{api.title}</div>
          <div className="dropdown-menu">
            <label htmlFor={`select-${index}`} className="sr-only">
              Select an option for API {index}
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
    ));
  };

  return (
    <div className="scenario-container">
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
    </div >
  );
};

export default CustomScenario;
