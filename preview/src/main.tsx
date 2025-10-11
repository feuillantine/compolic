import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import './styles.css';

const rawBaseUrl = import.meta.env.BASE_URL ?? '/';
const basename = rawBaseUrl === '/' ? undefined : rawBaseUrl.replace(/\/+$/, '');
const router = createBrowserRouter(routes, basename ? { basename } : undefined);

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
