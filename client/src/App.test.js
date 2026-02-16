import { render, screen } from '@testing-library/react';
import App from './App';

<<<<<<< HEAD
jest.mock('./components/EvolutionaryVisualizer', () => () => <div data-testid="visualizer" />);

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

test('renders serenify therapist chat title', () => {
  render(<App />);
  const titleElement = screen.getByText(/serenify therapist/i);
  expect(titleElement).toBeInTheDocument();
=======
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
});
