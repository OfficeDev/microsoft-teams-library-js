import './Scenario1.css';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Scenario1 } from './Scenario1';

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

describe('Scenario1 Component', () => {
  // Test case for app initialization scenario
  test('app initialization scenario', async () => {
    render(<Scenario1 />);

    // Simulate clicking on the "Run Scenario" button
    fireEvent.click(screen.getByTestId('run-scenario-button'));

    await waitFor(() => {
      const successMessage = screen.queryByText(/App Initialization Scenario successfully completed/i);
      expect(successMessage).not.toBeNull();
    });
  });

  // Add more test cases later
});
