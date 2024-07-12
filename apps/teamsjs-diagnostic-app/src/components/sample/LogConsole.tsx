import React, { useEffect, useState } from 'react';
import './LogConsole.css';

interface LogConsoleProps {
  initialLogs?: string[];
}

const MAX_LOGS = 100;

const LogConsole: React.FC<LogConsoleProps> = ({ initialLogs = [] }) => {
  const [logStatements, setLogStatements] = useState<string[]>(initialLogs);

  const captureConsoleLogs = (...args: any[]) => {
    const timestampedLog = `${new Date()} - ${args.join(' ')}`;
    setLogStatements(prevLogs => {
      const updatedLogs = [...prevLogs.slice(-MAX_LOGS + 1), timestampedLog];
      sessionStorage.setItem('logStatements', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  useEffect(() => {
    const loadLogsFromStorage = () => {
      const storedLogs = sessionStorage.getItem('logStatements');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        // Ensure maximum 100 logs loaded
        const cappedLogs = parsedLogs.slice(-MAX_LOGS);
        setLogStatements(cappedLogs);
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
  }, []);

  const handleClearLogs = () => {
    setLogStatements([]);
    sessionStorage.removeItem('logStatements');
  };

  return (
    <div>
      <h2>Log Console</h2>
      <div className="horizontal-box">
        <div className="content">
          <div className="log-console">
            <div className="log-actions">
              <button onClick={handleClearLogs} className="clear-logs-button">
                Clear Logs
              </button>
            </div>
            {logStatements.map((statement, index) => (
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
