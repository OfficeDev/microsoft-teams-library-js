import React, { useState } from 'react';
import './CustomScenario.css';
import { useDrop } from 'react-dnd';

import apiComponents, { ApiComponent } from './ApiComponents';
import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
import BarCodeAPIs from '../../apis/BarCodeApi';

const CustomScenario: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customScenario, setCustomScenario] = useState<Array<{ api: ApiComponent, func: string, input?: string }>>([]);

  const handleRunScenario = async () => {
    console.log('Running custom scenario...');
    for (const { api, func, input } of customScenario) {
      console.log(`Executing ${func} for ${api.title} with input: ${input}`);
      // Execute the API function based on the selected function and input
    }
  };

  const addToScenario = (api: ApiComponent, func: string, input?: string) => {
    console.log(`Adding ${func} for ${api.title} with input: ${input}`);
    setCustomScenario([...customScenario, { api, func, input }]);
  };

  const removeApiFromScenario = (index: number) => {
    setCustomScenario(customScenario.filter((_, i) => i !== index));
  };

  const clearScenario = () => {
    setCustomScenario([]);
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
          <AppInstallDialogAPIs apiComponent={api} onDropToScenarioBox={function (apiComponent: ApiComponent, selectedFunction: string, inputValue: string): void {
            throw new Error('Function not implemented.');
          } } />
        ) : api.title === 'Bar Code API' ? (
          <BarCodeAPIs apiComponent={api} onDropToScenarioBox={function (apiComponent: ApiComponent, func: string, input: string): void {
              throw new Error('Function not implemented.');
            } } />
        ) : null}
      </div>
    ));
  };

  return (
    <div className="scenario-container">
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
                <div key={index} className="dropped-api">
                  <span>{`${item.api.title}, ${item.func}${item.input ? `(${item.input})` : ''}`}</span>
                  <button onClick={() => removeApiFromScenario(index)} className="remove-api-button">X</button>
                </div>
              ))}
            </div>
          </div>
          <button className="clear-all-button" onClick={clearScenario}>Clear All</button>
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
  );
};

export default CustomScenario;
