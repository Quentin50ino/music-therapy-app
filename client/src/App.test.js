import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/EvolutionaryVisualizer', () => () => <div data-testid="visualizer" />);

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

test('renders serenify therapist chat title', () => {
  render(<App />);
  const titleElement = screen.getByText(/serenify therapist/i);
  expect(titleElement).toBeInTheDocument();
});
