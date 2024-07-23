import React, { useEffect, useState } from 'react';
import './LogConsole.css';

interface LogConsoleProps {
  initialLogs?: string[];
  maxLogs?: number; // Allow passing maximum logs as prop
}

const DEFAULT_MAX_LOGS = 100;

const LogConsole: React.FC<LogConsoleProps> = ({ initialLogs = [], maxLogs = DEFAULT_MAX_LOGS }) => {
  const [logStatements, setLogStatements] = useState<string[]>(initialLogs);
  const [filteredLogs, setFilteredLogs] = useState<string[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Function to capture console logs with line numbers
  const captureConsoleLogs = (...args: any[]) => {
    setLogStatements(prevLogs => {
      const lineNumber = prevLogs.length + 1;
      const timestamp = new Date();
      const logMessage = args.join(' ');
      const formattedLog = `${lineNumber}| ${timestamp} - ${logMessage}`;
      const updatedLogs = [...prevLogs.slice(-maxLogs + 1), formattedLog];
      sessionStorage.setItem('logStatements', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  useEffect(() => {
    const loadLogsFromStorage = () => {
      const storedLogs = sessionStorage.getItem('logStatements');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        const cappedLogs = parsedLogs.slice(-maxLogs);
        setLogStatements(cappedLogs);
        setFilteredLogs(cappedLogs);
      }
    };

    loadLogsFromStorage();

    const originalConsoleLog = console.log;
    console.log = function (...args: any[]) {
      captureConsoleLogs(...args);
      originalConsoleLog.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, [maxLogs]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredLogs(logStatements);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      setFilteredLogs(logStatements.filter(log => log.toLowerCase().includes(lowerCaseSearchTerm)));
    }
  }, [searchTerm, logStatements]);

  const handleClearLogs = () => {
    setLogStatements([]);
    setFilteredLogs([]);
    sessionStorage.removeItem('logStatements');
  };

  const handleDownloadLogs = () => {
    const logsText = logStatements.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'log_statements.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleShareLogs = (option: 'teams' | 'outlook') => {
    const logsText = logStatements.join('\n');
    if (option === 'teams') {
      const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=&message=${encodeURIComponent(logsText)}`;
      window.open(teamsUrl, '_blank');
    } else if (option === 'outlook') {
      const mailtoLink = `mailto:?subject=Log Statements&body=${encodeURIComponent(logsText)}`;
      window.open(mailtoLink, '_blank');
    }
  };

  return (
    <div>
      <h2>Log Console</h2>
      <div className="horizontal-box">
        <div className="content">
          <div className="log-console">
            <div className="log-actions">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="search-input"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="action-buttons">
                <button onClick={handleClearLogs} className="clear-logs-button">
                  Clear Logs
                </button>
                <button onClick={handleDownloadLogs} className="download-logs-button">
                  Download Logs
                </button>
                <div className="share-logs-dropdown">
                  <button onClick={() => setShowShareOptions(!showShareOptions)} className="share-logs-button">
                    Share Logs
                  </button>
                  {showShareOptions && (
                    <div className="share-options">
                      <button onClick={() => handleShareLogs('teams')} className="share-option">
                        Share to Teams
                      </button>
                      <button onClick={() => handleShareLogs('outlook')} className="share-option">
                        Share to Outlook
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {filteredLogs.map((statement, index) => {
              const parts = statement.split('|').map(part => part.trim());
              return (
                <div key={index} className="log-statement">
                  <span className="log-line-number">{parts[0]}</span>  
                  <span className="log-timestamp">{parts[1]}</span>
                  <span className="log-message">{parts[2]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogConsole;
