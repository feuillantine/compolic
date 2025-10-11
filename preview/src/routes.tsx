import type { RouteObject } from 'react-router';
import { Layout } from './layout/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
