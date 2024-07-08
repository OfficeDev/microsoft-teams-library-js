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
  // Test case for app initialization scenario
  test('app initialization scenario', async () => {
    render(<AppInitializationScenario />);

    // Simulate clicking on the "Run Scenario" button
    fireEvent.click(screen.getByTestId('run-scenario-button'));

    await waitFor(() => {
      const successMessage = screen.queryByText(/App Initialization Scenario successfully completed/i);
      expect(successMessage).not.toBeNull();
    });
  });

  // Add more test cases later
});