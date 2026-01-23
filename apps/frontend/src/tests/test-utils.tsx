import React from 'react';
import { render as rtlRender, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../presentation/contexts/toast.context';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

export const render = (
  ui: React.ReactElement,
  {
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult => {
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ToastProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from '@testing-library/react';
