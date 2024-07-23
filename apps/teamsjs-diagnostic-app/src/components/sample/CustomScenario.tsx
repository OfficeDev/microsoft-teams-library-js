import React, { useState } from 'react';
import './CustomScenario.css';
import { useDrop } from 'react-dnd';
import apiComponents, { ApiComponent } from './ApiComponents';
import { handleRunScenario } from './../../utils/HandleRunScenario';
import { app } from '@microsoft/teams-js';

app.initialize();

const CustomScenario: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customScenario, setCustomScenario] = useState<Array<{ api: ApiComponent, func: string, input?: string }>>([]);
  const [scenarioStatus, setScenarioStatus] = useState<string>('');
  const [showAddScenario, setShowAddScenario] = useState<boolean>(false);
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [selectedApis, setSelectedApis] = useState<{ [key: string]: boolean }>({});
  const [selectedFunctions, setSelectedFunctions] = useState<{ [key: string]: string }>({});
  const [apiInputs, setApiInputs] = useState<{ [key: string]: string }>({});
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string, scenario: Array<{ api: ApiComponent, func: string, input?: string }> }>>([]);
  const [showScenarioList, setShowScenarioList] = useState<boolean>(false);

  const handleRunScenarioClick = async () => {
    console.log('Running custom scenario...');
    setScenarioStatus('Running...');
  
    let isSuccess = true;
  
    for (const { api, func, input } of customScenario) {
  
      try {
        await handleRunScenario(api, func, input);
        console.log(`Success: ${func} for ${api.title}`);
      } catch (error: any) {
        console.error(`Failure: ${func} for ${api.title} - ${error.message}`);
        setScenarioStatus(`Failed: ${func} - ${error.message}`);
        isSuccess = false;
        console.log('Custom scenario failed.');
        break; // Stop further execution if any API fails
      }
    }
  
    if (isSuccess) {
      console.log('Custom scenario completed successfully.');
      setScenarioStatus('Success');
    }
  };

  const addToScenario = (api: ApiComponent, func: string, input?: string) => {
    console.log(`Adding ${func} for ${api.title} with input: ${input}`);
    if (customScenario.length < 5) {
      setCustomScenario([...customScenario, { api, func, input }]);
    } else {
      console.log('Maximum limit reached. Cannot add more APIs to the scenario.');
    }
  };

  const removeApiFromScenario = (index: number) => {
    setCustomScenario(customScenario.filter((_, i) => i !== index));
  };

  const clearScenario = () => {
    setCustomScenario([]);
    setScenarioStatus('');
  };

  const saveScenario = () => {
    if (!newScenarioName) {
      console.log('Scenario name is required.');
      return;
    }

    const newScenario = {
      name: newScenarioName,
      scenario: apiComponents
        .filter(api => selectedApis[api.title])
        .map(api => ({
          api,
          func: selectedFunctions[api.title] || '',
          input: apiInputs[api.title] || '',
        })),
    };

    if (newScenario.scenario.length > 0) {
      setSavedScenarios([...savedScenarios, newScenario]);
      setShowAddScenario(false);
      setNewScenarioName('');
      setSelectedApis({});
      setSelectedFunctions({});
      setApiInputs({});
    } else {
      console.log('No APIs selected.');
    }
  };

  const loadScenario = (scenario: { name: string, scenario: Array<{ api: ApiComponent, func: string, input?: string }> }) => {
    setCustomScenario(scenario.scenario);
    setShowScenarioList(false);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'API',
    drop: (item: { api: ApiComponent, func: string, input?: string }) => addToScenario(item.api, item.func, item.input),
    canDrop: () => customScenario.length < 5,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [customScenario]);

  const generateCustomScenario = () => {
    return customScenario.map((item, index) => (
      <React.Fragment key={index}>
        <div className="dropped-api">
          <span>{`${item.api.title}, ${item.func}${item.input ? `(${item.input})` : ''}`}</span>
          <button onClick={() => removeApiFromScenario(index)} className="remove-api-button">X</button>
        </div>
      </React.Fragment>
    ));
  };

  const generateVerticalBoxes = () => {
    const filteredApis = apiComponents.filter(api =>
      api.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return filteredApis.map((api: ApiComponent, index: number) => (
      <div key={index} className="vertical-box">
        {api.renderComponent ? (
          api.renderComponent({ apiComponent: api, onDropToScenarioBox: addToScenario })
        ) : (
          <div>
            <h3>{api.title}</h3>
          </div>
        )}
      </div>
    ));
  };  

  const handleFunctionSelection = (apiTitle: string, func: string) => {
    setSelectedFunctions(prev => ({ ...prev, [apiTitle]: func }));
  };

  const handleApiSelection = (apiTitle: string, isChecked: boolean) => {
    setSelectedApis(prev => ({ ...prev, [apiTitle]: isChecked }));
  };

  const handleInputChange = (apiTitle: string, input: string) => {
    setApiInputs(prev => ({ ...prev, [apiTitle]: input }));
  };

  const handleDeleteScenario = (index: number) => {
    setSavedScenarios(savedScenarios.filter((_, i) => i !== index));
  };

  return (
    <div className="scenario-container">
      <div className="scenario2-container" ref={drop} style={{ backgroundColor: isOver ? 'lightgreen' : 'transparent' }}>
        <div className="scenario2-header">
          <h2>Custom Scenario</h2>
          <p>Drag and drop API components here to build your custom scenario.</p>
        </div>
        <div className="custom-scenario-box">
          <button className="scenario1-button" onClick={handleRunScenarioClick}>Run Scenario</button>
          <div className="api-section">
            <div className="api-header">APIs Being Run:</div>
            <div className="vertical-box-container">
              {generateCustomScenario()}
            </div>
          </div>
          <div className= "button-group-vertical">
          <button className="clear-all-button" onClick={clearScenario}>Clear All</button>
          <button className="plus-sign-button" onClick={() => setShowAddScenario(true)}>+</button>
          <button className="scenario-list-button" onClick={() => setShowScenarioList(true)}>Saved Scenarios</button>
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

      {showAddScenario && (
        <div className="add-dialog active">
          <div className="addScenario-content">
            <h2>Create New Scenario</h2>
            <label htmlFor="scenario-name">Scenario Name:</label>
            <input
              type="text"
              id="scenario-name"
              placeholder="Enter scenario name"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
            />
            <div className="api-selection">
              {apiComponents.map((api, index) => (
                <div key={index} className="api-item">
                  <input
                    type="checkbox"
                    id={api.title}
                    checked={selectedApis[api.title] || false}
                    onChange={(e) => handleApiSelection(api.title, e.target.checked)}
                  />
                  <label htmlFor={api.title}>{api.title}</label>
                  {selectedApis[api.title] && (
                    <div className="function-selection">
                      <select
                        aria-label="Select function"
                        value={selectedFunctions[api.title] || ''}
                        onChange={(e) => handleFunctionSelection(api.title, e.target.value)}
                      >
                        <option value="" disabled>Select function</option>
                        {api.options.map((func, idx) => (
                          <option key={idx} value={func}>{func}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Input"
                        value={apiInputs[api.title] || ''}
                        onChange={(e) => handleInputChange(api.title, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={saveScenario}>Save Scenario</button>
            <button onClick={() => setShowAddScenario(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showScenarioList && (
        <div className="scenario-list active">
          <div className="scenario-list-content">
            <h2>Saved Scenarios</h2>
            {savedScenarios.length > 0 ? (
              <ul>
                {savedScenarios.map((scenario, index) => (
                  <li key={index}>
                    <span>{scenario.name}</span>
                    <button onClick={() => loadScenario(scenario)}>Load</button>
                    <button onClick={() => handleDeleteScenario(index)}>Delete</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved scenarios.</p>
            )}
            <button onClick={() => setShowScenarioList(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomScenario;
