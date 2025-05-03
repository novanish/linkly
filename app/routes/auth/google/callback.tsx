import { decodeIdToken, type OAuth2Tokens } from 'arctic';
import { redirect } from 'react-router';
import {
  codeVerifierCookie,
  google,
  oauthStateCookie,
} from '~/auth/google.server';
import { authSession } from '~/auth/session.server';
import { db } from '~/db';
import { AUTH_PROVIDER, identities, users } from '~/db/schema.server';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    return new Response('Missing code or state', {
      status: 400,
    });
  }

  const cookie = request.headers.get('Cookie');
  const storedState = await oauthStateCookie.parse(cookie);
  const codeVerifier = await codeVerifierCookie.parse(cookie);
  if (!storedState || !codeVerifier) {
    return new Response('Missing state or code verifier', {
      status: 400,
    });
  }

  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response(null, {
      status: 400,
    });
  }

  const claims = decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims;
  const googleUserId = claims.sub;
  const name = claims.name;
  const email = claims.email!;
  const picture = claims.picture!;

  const userId = await db.transaction(async (tx) => {
    let [user] = await tx
      .insert(users)
      .values({ email, name, avatarUrl: picture })
      .onConflictDoNothing()
      .returning({ id: users.id });

    if (!user) {
      user = (await tx.query.users.findFirst({
        columns: { id: true },
        where: (users, { eq }) => eq(users.email, email),
      }))!;
    }

    await tx
      .insert(identities)
      .values({
        userId: user.id,
        provider: AUTH_PROVIDER.GOOGLE,
        providerId: googleUserId,
      })
      .onConflictDoNothing();

    return user.id;
  });

  return redirect('/', {
    headers: {
      'Set-Cookie': await authSession.create({ userId }),
    },
  });
}

interface GoogleIdTokenClaims {
  sub: string;
  name?: string;
  email: string;
  picture?: string;
}
