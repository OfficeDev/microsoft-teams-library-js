import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppInitializationScenario from './AppInitializationScenario';

jest.mock('@microsoft/teams-js', () => ({
  app: {
    initialize: jest.fn(),
  },
}));

jest.mock('../../apis/AppApi', () => ({
  getContextV2: jest.fn(() => Promise.resolve({})),
  registerBeforeSuspendOrTerminateHandler: jest.fn(() => Promise.resolve()),
  registerOnResume: jest.fn(() => Promise.resolve()),
  registerOnThemeChangeHandlerV2: jest.fn(() => Promise.resolve()),
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

    await waitFor(
      () => {
        const successMessage = screen.queryByText(/App Initialization Scenario successfully completed/i);
        if (!successMessage) {
          throw new Error('Success message not found');
        }
      },
      { timeout: 5000 }
    );
  });
});
