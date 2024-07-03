// LogConsole.tsx
import React, { useEffect, useState } from 'react';
import './LogConsole.css';

interface LogConsoleProps {
  initialLogs?: string[]; // Optional initial logs prop
}

const LogConsole: React.FC<LogConsoleProps> = ({ initialLogs = [] }) => {
  const [logStatements, setLogStatements] = useState<string[]>(initialLogs);

  useEffect(() => {
    const captureConsoleLogs = (log: string) => {
      setLogStatements(prevLogs => [...prevLogs, log]);
    };

    // Example useEffect to initialize logging capture
    const originalConsoleLog = console.log;
    console.log = function (...args: any[]) {
      const message = args.join(' ');
      captureConsoleLogs(message);
      originalConsoleLog.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog; // Restore original console.log when component unmounts
    };
  }, []); // Ensure this runs only once

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
