import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),

  layout(
    'routes/auth/layout.tsx',
    prefix('auth', [
      route('login', 'routes/auth/login.tsx'),
      route('logout', 'routes/auth/logout.tsx'),
      route('verify-magic-link', 'routes/auth/magic-link/verify.tsx'),
      ...prefix('google', [
        route('login', 'routes/auth/google/login.tsx'),
        route('callback', 'routes/auth/google/callback.tsx'),
      ]),
    ]),
  ),

  layout('routes/authenticated-layout.tsx', [
    ...prefix('link', [
      route('create', 'routes/link/create.tsx'),
      route('edit/:linkId', 'routes/link/edit.tsx'),
      route('qr', 'routes/link/qr.tsx'),
    ]),

    ...prefix('user', [
      route('profile', 'routes/user/profile.tsx'),
      route('sessions', 'routes/user/sessions.tsx'),
    ]),

    layout(
      'routes/dashboard/layout.tsx',
      prefix('dashboard', [
        route('overview', 'routes/dashboard/overview.tsx'),
        route('links', 'routes/dashboard/links.tsx'),
        route('analytics', 'routes/dashboard/analytics.tsx'),
      ]),
    ),
  ]),

  route('/s?/:shortCode', 'routes/redirect/index.tsx'),

  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
