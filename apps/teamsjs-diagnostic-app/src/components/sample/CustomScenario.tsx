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
        console.log("Enter");
        await handleRunScenario(api, func, input);
        console.log(`Success: ${func} for ${api.title}`);
        console.log("Exit");
      } catch (error: any) {
        console.log(`Failure: ${func} for ${api.title} - ${error.message}`);
        console.log("Exit");
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
    const filteredApis = apiComponents
      .filter(api =>
        api.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      // Alphabetical sorting
      .sort((a, b) => a.title.localeCompare(b.title));
    
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
    if (!isChecked) {
      // If unselecting, remove any related function and input
      setSelectedFunctions(prev => ({ ...prev, [apiTitle]: '' }));
      setApiInputs(prev => ({ ...prev, [apiTitle]: '' }));
    }
  };

  const handleInputChange = (apiTitle: string, input: string) => {
    setApiInputs(prev => ({ ...prev, [apiTitle]: input }));
  };

  const handleDeleteScenario = (index: number) => {
    setSavedScenarios(savedScenarios.filter((_, i) => i !== index));
  };

  const handleAddDefaultInput = (apiTitle: string) => {
    const api = apiComponents.find(api => api.title === apiTitle);
    if (api) {
      const defaultInput = api.defaultInput || '';
      setApiInputs(prev => ({ ...prev, [apiTitle]: defaultInput }));
    }
  };

  const handleClearAll = () => {
    setSelectedApis({});
    setSelectedFunctions({});
    setApiInputs({});
    setNewScenarioName('');
  };  

  const handlePreviewClick = () => {
    window.open('https://learn.microsoft.com/en-us/javascript/api/@microsoft/teams-js/?view=msteams-client-js-latest', '_blank');
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
        <button aria-label="Definitions" title="Definitions" className="btn btn-icon" onClick={handlePreviewClick}>
          <i className="fa-solid fa-book-open"></i>
        </button>
        <div className="all-api-box">{generateVerticalBoxes()}</div>
      </div>

      {showAddScenario && (
  <div className="add-dialog active">
    <div className="addScenario-content">
      <div className="dialog-header">
        <h2>Create New Scenario</h2>
        <button className="clear-all-button2" onClick={handleClearAll}>Clear All</button>
      </div>
      <label htmlFor="scenario-name">Scenario Name:</label>
      <input
        type="text"
        id="scenario-name"
        placeholder="Enter scenario name"
        value={newScenarioName}
        onChange={(e) => setNewScenarioName(e.target.value)}
      />
      <div className="api-selection">
        {apiComponents
        //Alphabetical order
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((api, index) => (
            <div key={index} className="api-item">
              <input
                type="checkbox"
                id={api.title}
                checked={selectedApis[api.title] || false}
                onChange={(e) => handleApiSelection(api.title, e.target.checked)}
              />
              <label htmlFor={api.title}>{api.title}</label>
              {selectedApis[api.title] && (
                <div className="function-input-group">
                  <select
                    aria-label="Select function"
                    value={selectedFunctions[api.title] || ''}
                    onChange={(e) => handleFunctionSelection(api.title, e.target.value)}
                  >
                    <option value="">Select Function</option>
                    {api.functions.map((func, i) => (
                      <option key={i} value={func.name}>{func.name}</option>
                    ))}
                  </select>
                  {selectedFunctions[api.title] && api.functions.find(func => func.name === selectedFunctions[api.title])?.requiresInput && (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter input"
                        value={apiInputs[api.title] || ''}
                        onChange={(e) => handleInputChange(api.title, e.target.value)}
                      />
                      <button className="default-input2" onClick={() => handleAddDefaultInput(api.title)}>Default Input</button>
                    </div>
                  )}
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
            <div className="saved-scenarios-dialog active">
              <div className="saved-scenarios-content">
                <h2>Saved Scenarios</h2>
                <ul>
                  {savedScenarios.map((scenario, index) => (
                    <li key={index}>
                      <button onClick={() => loadScenario(scenario)}>{scenario.name}</button>
                      <button className="delete-button" onClick={() => handleDeleteScenario(index)}>X</button>
                    </li>
                  ))}
                </ul>
                <button className="close-button" onClick={() => setShowScenarioList(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
  );
};

export default CustomScenario;
