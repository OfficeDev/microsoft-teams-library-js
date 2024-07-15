import React, { useState } from 'react';
import './CustomScenario.css';
import { useDrop } from 'react-dnd';
import apiComponents, { ApiComponent } from './ApiComponents';
import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
import BarCodeAPIs from '../../apis/BarCodeApi';
import CalendarAPIs from '../../apis/CalendarApi';
import CallAPIs from '../../apis/CallApi';
import ChatAPIs from '../../apis/ChatApi';
import DialogAPIs from '../../apis/DialogApi';
import { handleRunScenario } from './../../utils/HandleRunScenario';
import { TransformerContext } from '../../utils/TransformerContext';
import { NoInputStrategy } from '../../utils/NoInputStrategy';
import { TextInputStrategy } from '../../utils/TextInputStrategy';
import { CheckboxInputStrategy } from '../../utils/CheckboxInputStrategy';

const CustomScenario: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customScenario, setCustomScenario] = useState<Array<{ api: ApiComponent, func: string, inputType: string, input?: string }>>([]);
  
  const handleRunScenarioClick = async () => {
    console.log('Running custom scenario...');
  
    try {
      const transformerContext = new TransformerContext(new NoInputStrategy());
  
      for (let i = 0; i < customScenario.length; i++) {
        const { api, func, inputType, input } = customScenario[i];
        console.log(`Executing ${func} of ${api.title}...`);
  
        if (i > 0) {
          const prevApi = customScenario[i - 1];
          const output = await handleRunScenario(prevApi.api, prevApi.func, prevApi.input);
          console.log(`Output from previous API ${prevApi.func}:`, output);
  
          // Set the appropriate strategy based on the input type
          switch (inputType) {
            case 'text':
              transformerContext.setStrategy(new TextInputStrategy());
              break;
            case 'checkbox':
              transformerContext.setStrategy(new CheckboxInputStrategy());
              break;
            default:
              transformerContext.setStrategy(new NoInputStrategy());
              break;
          }
  
          // Transform the output to be the input of the current API
          const transformedInput = transformerContext.executeStrategy(output);
          console.log(`Transformed input for ${func}:`, transformedInput);
          customScenario[i].input = transformedInput;
        }
  
        // Execute the current API
        const result = await handleRunScenario(api, func, input);
        console.log(`Success: ${func} -`, result);
      }
    } catch (error: any) {
      console.error('Error during scenario execution:', error.message);
    }
  };
  

  const addToScenario = (api: ApiComponent, func: string, inputType: string, input?: string) => {
    console.log(`Adding ${func} for ${api.title} with input: ${input}`);
    if (customScenario.length < 5) {
      setCustomScenario([...customScenario, { api, func, inputType, input }]);
    } else {
      console.log('Maximum limit reached. Cannot add more APIs to the scenario.');
    }
  };

  const removeApiFromScenario = (index: number) => {
    setCustomScenario(customScenario.filter((_, i) => i !== index));
  };

  const clearScenario = () => {
    setCustomScenario([]);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'API',
    drop: (item: { api: ApiComponent, func: string, inputType: string, input?: string }) => addToScenario(item.api, item.func, item.inputType, item.input),
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
        {api.title === 'App Install Dialog API' ? (
          <AppInstallDialogAPIs apiComponent={api} onDropToScenarioBox={addToScenario} />
        ) : api.title === 'Bar Code API' ? (
          <BarCodeAPIs apiComponent={api} onDropToScenarioBox={addToScenario} />
        ) : api.title === 'Calendar API' ? (
          <CalendarAPIs apiComponent={api} onDropToScenarioBox={addToScenario} />
        ) : api.title === 'Call API' ? (
          <CallAPIs apiComponent={api} onDropToScenarioBox={addToScenario} />
        ) : api.title === 'Chat API' ? (
          <ChatAPIs apiComponent={api} onDropToScenarioBox={addToScenario} />
        ) : api.title === 'Dialog API' ? (
          <DialogAPIs apiComponent={api} onDropToScenarioBox={addToScenario} />
        ) : null}
      </div>
    ));
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
