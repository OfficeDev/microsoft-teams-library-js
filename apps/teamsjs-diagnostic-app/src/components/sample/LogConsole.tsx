import React, { useEffect, useState } from 'react';
import './LogConsole.css';
import { jsPDF } from 'jspdf';

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

  const captureConsoleLogs = (...args: any[]) => {
    const timestampedLog = `${new Date()} - ${args.join(' ')}`;
    setLogStatements(prevLogs => {
      const updatedLogs = [...prevLogs.slice(-maxLogs + 1), timestampedLog];
      sessionStorage.setItem('logStatements', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  useEffect(() => {
    const loadLogsFromStorage = () => {
      const storedLogs = sessionStorage.getItem('logStatements');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        // Ensure maximum logs loaded based on maxLogs prop
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
  }, [maxLogs, captureConsoleLogs]); // Re-run effect if maxLogs prop changes

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
    const doc = new jsPDF();
    let yOffset = 10;
    const maxLineWidth = 180; // Maximum line width in mm
    const lineHeight = 10;

    logStatements.forEach((log, index) => {
      const splitText = doc.splitTextToSize(log, maxLineWidth);
      splitText.forEach((line: string | string[]) => {
        if (yOffset > 280) {  // Adjust page break threshold
          doc.addPage();
          yOffset = 10;
        }
        doc.text(line, 10, yOffset);
        yOffset += lineHeight;
      });
    });

    doc.save('log_statements.pdf');
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
            {filteredLogs.map((statement, index) => (
              <div key={index} className="log-statement">
                {statement}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogConsole;
