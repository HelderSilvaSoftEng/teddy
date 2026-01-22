import { render } from '../test-utils';
import App from '../../app/app';

describe('App Component', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the app with BrowserRouter', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
