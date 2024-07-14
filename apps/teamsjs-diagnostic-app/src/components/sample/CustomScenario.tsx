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

const CustomScenario: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customScenario, setCustomScenario] = useState<Array<{ api: ApiComponent, func: string, input?: string }>>([]);
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('default');
  const [showTransformerDialog, setShowTransformerDialog] = useState<{ api: ApiComponent, index: number } | null>(null);

  const handleRunScenarioClick = async () => {
    console.log('Running custom scenario...');

    for (let i = 0; i < customScenario.length; i++) {
      const { api, func, input } = customScenario[i];
      console.log(`Executing ${func}...`);

      // Check if there's a transformer defined before this API call
      if (i > 0) {
        console.log('Applying Transformer...');
        const transformedInput = await applyTransformer(customScenario[i - 1], api, input);
        if (transformedInput !== undefined) {
          console.log(`Transformed input for ${func}: ${transformedInput}`);
        } else {
          console.log(`No transformation needed for ${func}`);
        }
      }

      try {
        const result = await handleRunScenario(api, func, input);
        console.log(`Success: ${func} - ${result}`);
      } catch (error: any) {
        console.error(`Error: ${func} - ${error.message}`);
        break;
      }
    }
  };

  //ADD TO THIS!!
  const applyTransformer = async (prevApi: { api: ApiComponent, func: string, input?: string }, currentApi: ApiComponent, input?: string) => {
    // Placeholder for transformation logic
    // Implement your specific transformation logic here
    console.log(`Applying default transformation logic from ${prevApi.func} to ${currentApi.title}`);

    // Concatenate the output of the previous API with the input of the current API
    return `${prevApi.func} output -> ${input}`;
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
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'API',
    drop: (item: { api: ApiComponent, func: string, input?: string }) => addToScenario(item.api, item.func, item.input),
    canDrop: () => customScenario.length < 5,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [customScenario]);

  const handleTransformerClick = (api: ApiComponent, index: number) => {
    setShowTransformerDialog({ api, index });
  };

  const handleTabClick = (tab: 'default' | 'custom') => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (activeTab === 'default') {
      return (
        <div className="tab-content">
          <p>Default transformation logic goes here.</p>
        </div>
      );
    } else {
      return (
        <div className="tab-content">
          <p>User-defined transformation logic editor goes here.</p>
        </div>
      );
    }
  };

  const closeTransformerDialog = () => {
    setShowTransformerDialog(null);
  };

  const generateCustomScenario = () => {
    return customScenario.map((item, index) => (
      <React.Fragment key={index}>
        <div className="dropped-api">
          <span>{`${item.api.title}, ${item.func}${item.input ? `(${item.input})` : ''}`}</span>
          <button onClick={() => removeApiFromScenario(index)} className="remove-api-button">X</button>
        </div>
        {index < customScenario.length - 1 && (
          <div className="transformer-trigger" onClick={() => handleTransformerClick(item.api, index)}>
            Transformer
          </div>
        )}
        {showTransformerDialog && showTransformerDialog.index === index && (
          <div className="transformer-box">
            <span onClick={closeTransformerDialog}>Close</span>
            <div className="transformer-tabs">
              <div className={`tab ${activeTab === 'default' ? 'active' : ''}`} onClick={() => handleTabClick('default')}>Default</div>
              <div className={`tab ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => handleTabClick('custom')}>Custom</div>
            </div>
            {renderTabContent()}
          </div>
        )}
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
