import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppInitializationScenario from './AppInitializationScenario';

jest.mock('@microsoft/teams-js', () => ({
  app: {
    initialize: jest.fn(),
  },
}));

jest.mock('../../apis/AppApi', () => ({
  registerOnResume: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../apis/AuthenticationStart', () => ({
  authenticateUser: jest.fn(() => Promise.resolve(true)),
}));

describe('App Initialization Component', () => {
  afterEach(() => {
    // Clear all mock functions after each test
    jest.clearAllMocks();
  });

  test('app initialization scenario', () => {
    render(<AppInitializationScenario />);

    fireEvent.click(screen.getByTestId('run-scenario-button'));

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        reject(new Error('Timeout waiting for success message'));
      }, 5000);

      const checkSuccessMessage = () => {
        const successMessage = screen.queryByText(/App Initialization Scenario successfully completed/i);
        if (successMessage) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkSuccessMessage, 100); // Check every 100ms
        }
      };

      checkSuccessMessage();
    });
  });

});
