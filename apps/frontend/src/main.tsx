import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { AuthProvider } from './presentation/contexts';
import { SelectedCustomersProvider } from './presentation/contexts';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SelectedCustomersProvider>
          <App />
        </SelectedCustomersProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
