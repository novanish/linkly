import { href, redirect } from 'react-router';
import type { Route } from './+types/logout';
import { authSession } from '~/auth/session.server';

export async function action({ request }: Route.ActionArgs) {
  return redirect(href('/'), {
    headers: {
      'Set-Cookie': await authSession.destroy(request),
    },
  });
}
