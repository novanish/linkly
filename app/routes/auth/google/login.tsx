import { generateCodeVerifier, generateState } from 'arctic';
import { redirect } from 'react-router';
import {
  google,
  codeVerifierCookie,
  oauthStateCookie,
} from '~/auth/google.server';

export async function loader() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    'openid',
    'profile',
    'email',
  ]);

  const headers = new Headers();
  headers.append('Set-Cookie', await oauthStateCookie.serialize(state));
  headers.append(
    'Set-Cookie',
    await codeVerifierCookie.serialize(codeVerifier),
  );

  return redirect(url.toString(), {
    headers,
  });
}
