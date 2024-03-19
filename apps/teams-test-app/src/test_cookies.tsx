// import React, { useState, useEffect } from 'react';
// import { ModuleWrapper } from './components/utils/ModuleWrapper';

// const CookieManager: React.FC = () => {
//   const [hasAccess, setHasAccess] = useState(false);
//   const [cookies, setCookies] = useState<string>('');
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     handleCookieAccessInit();
//   }, []);

//   const updateCookiesOutput = () => {
//     console.log('Read the document cookies:', document.cookie);
//     setCookies(document.cookie || 'No cookies found');
//   };

//   const refreshCookies = async () => {
//     if (!hasAccess) {
//       console.log("Don't have access. Trying again within this click handler, in case it needed a prompt.");
//       try {
//         // Assuming document.requestStorageAccess exists, might need to extend types
//         await (document as any).requestStorageAccess();
//         console.log('Have access now thanks to prompt');
//         setError('');
//         setHasAccess(true);
//       } catch (err) {
//         console.error('requestStorageAccess Error:', err);
//         setError('Permission denied. Either blocked by user or browser');
//       }

//       const access = await (document as any).hasStorageAccess();
//       console.log('Updated hasAccess:', access);
//       setHasAccess(access);
//     }
//     updateCookiesOutput();
//   };

//   const hasCookieAccess = async (): Promise<boolean> => {
//     if (!(document as any).requestStorageAccess) {
//       console.log('Storage Access API not supported. Assume we have access.');
//       return true;
//     }

//     const accessGranted = await (document as any).hasStorageAccess();
//     console.log('Cookie access already granted');
//     return accessGranted;
//   };

//   const handleCookieAccessInit = async () => {
//     const access = await hasCookieAccess();
//     setHasAccess(access);
//     updateCookiesOutput();
//   };

//   return (
//     <div>
//       <div id="cookies">{cookies}</div>
//       <div id="error">{error}</div>
//       <button id="refresh-cookies" onClick={refreshCookies}>
//         Refresh Cookies
//       </button>
//     </div>
//   );
// };

// export default CookieManager;

import React, { useEffect, useState } from 'react';

const CookieManager: React.FC = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [cookies, setCookies] = useState<string | null>(null); // Initialize as null
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCookieAccessInit();
  }, []);

  const updateCookiesOutput = () => {
    // console.log('Read the document cookies:', document.cookie);
    // setCookies(document.cookie || 'No cookies found');
    const cookieValue = document.cookie || null; // Get cookie value or null if none
    console.log('Read the document cookies:', cookieValue);
    setCookies(cookieValue); // Update state to show cookies or null if none
    setError(null); // Reset error state on successful cookie retrieval
  };

  const refreshCookies = async () => {
    if (!hasAccess) {
      console.log("Don't have access. Trying again within this click handler, in case it needed a prompt.");
      try {
        // Assuming document.requestStorageAccess exists, might need to extend types
        await (document as any).requestStorageAccess();
        console.log('Have access now thanks to prompt');
        setError(null); // Clear any previous error on successful access
        setHasAccess(true);
        updateCookiesOutput(); // Update cookie output after gaining access
      } catch (err) {
        console.error('requestStorageAccess Error:', err);
        setError('Permission denied. Either blocked by user or browser');
        setCookies(null); // Clear any previous cookies
      }

      const access = await (document as any).hasStorageAccess();
      console.log('Updated hasAccess:', access);
      setHasAccess(access);
    } else {
      updateCookiesOutput();
    }
  };

  const hasCookieAccess = async (): Promise<boolean> => {
    if (!(document as any).requestStorageAccess) {
      console.log('Storage Access API not supported. Assume we have access.');
      return true;
    }

    const accessGranted = await (document as any).hasStorageAccess();
    console.log('Cookie access already granted');
    return accessGranted;
  };

  const handleCookieAccessInit = async () => {
    const access = await hasCookieAccess();
    setHasAccess(access);
  };

  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, 400px)', margin: 15 }}>
      <h1 style={{ gridColumn: '1 / -1' }}>3P Cookies</h1>
      <div
        className="boxAndButton"
        style={{
          border: '5px solid black',
          // display: 'grid',
          gridTemplateRows: 'auto auto 150px auto 150px',
          height: 200,
        width: 400,
        gap: 10,
        textAlign: 'center',
        }}
      >
        <button id="refresh-cookies" onClick={refreshCookies}>
          Refresh Cookies
        </button>
        <div
          className="box"
          style={{
            border: '2px solid red',
            height: 150,
            overflow: 'auto',
            // padding: 150,
            // display: 'grid',
            // gap: 10,
          }}
        >
          {/* Conditionally render "Cookies: " or "Error: " text with their values after click */}
          {cookies !== null && <span>Cookies: {cookies}</span>}
          {error !== null && <span>Error: {error}</span>}
        </div>
      </div>
    </div>
  );
};

export default CookieManager;
