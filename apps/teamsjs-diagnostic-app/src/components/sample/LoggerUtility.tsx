export const captureConsoleLogs = (callback: (log: string) => void) => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    //const originalConsoleWarn = console.warn;
    //const originalConsoleInfo = console.info;
  
    console.log = function (...args: any[]) {
        const currentDate = new Date();
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        const seconds = currentDate.getSeconds().toString().padStart(2, "0");
        const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = currentDate.getDate().toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString().slice(-2);
        const formattedTimestamp = `[ ${hours}:${minutes}:${seconds}:${milliseconds} ${month}/${day}/${year} ]`;
    
        const message = `${formattedTimestamp} ${args.join(' ')}`;
        if (!message.includes("captureConsoleLogs")) {
            callback(message);
        }
        originalConsoleLog.apply(console, [message]);
    };
  
    console.error = function (...args: any[]) {
        const currentDate = new Date();
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        const seconds = currentDate.getSeconds().toString().padStart(2, "0");
        const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = currentDate.getDate().toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString().slice(-2);
        const formattedTimestamp = `[ ${hours}:${minutes}:${seconds}:${milliseconds} ${month}/${day}/${year} ]`;
    
        const message = `${formattedTimestamp} ERROR: ${args.join(' ')}`;
        if (!message.includes("captureConsoleLogs")) {
            callback(message);
        }
        originalConsoleError.apply(console, [message]);
    };
  
    /*
    console.warn = function (...args: any[]) {
        const currentDate = new Date();
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        const seconds = currentDate.getSeconds().toString().padStart(2, "0");
        const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = currentDate.getDate().toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString().slice(-2);
        const formattedTimestamp = `[ ${hours}:${minutes}:${seconds}:${milliseconds} ${month}/${day}/${year} ]`;
    
        const message = `${formattedTimestamp} WARN: ${args.join(' ')}`;
        if (!message.includes("captureConsoleLogs")) {
            callback(message);
        }
        originalConsoleWarn.apply(console, [message]);
    };
  
    console.info = function (...args: any[]) {
        const currentDate = new Date();
        const hours = currentDate.getHours().toString().padStart(2, "0");
        const minutes = currentDate.getMinutes().toString().padStart(2, "0");
        const seconds = currentDate.getSeconds().toString().padStart(2, "0");
        const milliseconds = currentDate.getMilliseconds().toString().padStart(3, "0");
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = currentDate.getDate().toString().padStart(2, "0");
        const year = currentDate.getFullYear().toString().slice(-2);
        const formattedTimestamp = `[ ${hours}:${minutes}:${seconds}:${milliseconds} ${month}/${day}/${year} ]`;
    
        const message = `${formattedTimestamp} INFO: ${args.join(' ')}`;
        if (!message.includes("captureConsoleLogs")) {
            callback(message);
        }
        originalConsoleInfo.apply(console, [message]);
    };*/
};
