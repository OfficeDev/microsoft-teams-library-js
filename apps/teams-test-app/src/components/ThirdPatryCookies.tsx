/* eslint-disable @microsoft/sdl/no-cookies */
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const SetCookie = (): React.ReactElement => {
  const setCookies = async (): Promise<string> => {
    try {
      const access = await requestCookieAccess();
      if (!access) {
        return 'Permission denied. Either blocked by user or browser';
      }

      document.cookie = 'testCookies=testvalue; path=/; Secure; SameSite=None';
      return document.cookie.includes('testCookies=testvalue') ? 'true' : 'false';
    } catch (err) {
      console.error('Error setting cookies:', err);
      return 'false';
    }
  };

  return ApiWithoutInput({
    name: 'Set3PCookie',
    title: 'Set 3P Cookie',
    onClick: setCookies,
  });
};

const CheckCookieAccess = (): React.ReactElement => {
  const refreshCookies = async (): Promise<string> => {
    const access = await requestCookieAccess();
    if (!access) {
      return 'Permission denied. Either blocked by user or browser';
    }

    // Get and return the current cookie value
    const cookieValue = document.cookie || 'No cookies found';
    console.log('Read the document cookies:', cookieValue);
    return cookieValue;
  };

  return ApiWithoutInput({
    name: 'Check3PCookiesAccess',
    title: 'Check 3P Cookies Access',
    onClick: refreshCookies,
  });
};

const hasCookieAccess = async (): Promise<boolean> => {
  if (!document.hasStorageAccess) {
    console.log(
      'Storage Access API not supported. Assume it is an older browser that does not block 3P cookies and we have access.',
    );
    return true;
  }
  const accessState = await document.hasStorageAccess();
  return accessState;
};

const requestCookieAccess = async (): Promise<boolean> => {
  const access = await hasCookieAccess();
  if (!access) {
    try {
      await document.requestStorageAccess();
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return true;
};

const CookieAccessComponent = (): ReactElement => (
  <ModuleWrapper title="3PCookieManagerTest">
    <SetCookie />
    <CheckCookieAccess />
  </ModuleWrapper>
);

export default CookieAccessComponent;
