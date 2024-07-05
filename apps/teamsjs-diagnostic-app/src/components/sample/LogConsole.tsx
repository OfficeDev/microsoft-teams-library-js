import React, { useEffect, useState } from 'react';
import './LogConsole.css';

interface LogConsoleProps {
  initialLogs?: string[];
}

const LogConsole: React.FC<LogConsoleProps> = ({ initialLogs = [] }) => {
  const [logStatements, setLogStatements] = useState<string[]>(initialLogs);

  const captureConsoleLogs = (...args: any[]) => {
    const timestampedLog = `${new Date()} - ${args.join(' ')}`;
    setLogStatements(prevLogs => {
      const updatedLogs = [...prevLogs, timestampedLog];
      // Store updated logs in sessionStorage
      sessionStorage.setItem('logStatements', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  useEffect(() => {
    // Function to load initial logs from sessionStorage
    const loadLogsFromStorage = () => {
      const storedLogs = sessionStorage.getItem('logStatements');
      if (storedLogs) {
        setLogStatements(JSON.parse(storedLogs));
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

  return (
    <div>
      <h2>Log Console</h2>
      <div className="horizontal-box">
        <div className="content">
          <div className="log-console">
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
