import { Google } from 'arctic';
import { createCookie, href, type CookieOptions } from 'react-router';
import { env } from '~/env/server';
import { sec } from '~/lib/utils';

const cookieOptions: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: sec('10 minutes'),
  sameSite: 'lax',
};

export const oauthStateCookie = createCookie(
  'google_oauth_state',
  cookieOptions,
);
export const codeVerifierCookie = createCookie(
  'google_code_verifier',
  cookieOptions,
);

const redirectUri = new URL(href('/auth/google/callback'), env.ORIGIN);

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  redirectUri.toString(),
);
