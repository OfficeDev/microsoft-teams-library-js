import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  test('app initialization scenario', async () => {
    render(<AppInitializationScenario />);

    fireEvent.click(screen.getByTestId('run-scenario-button'));

    await waitFor(() => {
      console.log('waiting for successMessage');
      const successMessage = screen.queryByText(/App Initialization Scenario successfully completed/i);
      expect(successMessage).not.toBeNull();
    }, {
      timeout: 5000,
    });
  });

  // Add more test cases later
});
