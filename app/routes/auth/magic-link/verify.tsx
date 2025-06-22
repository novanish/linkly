import { AlertCircle } from 'lucide-react';
import { href, Link, redirect } from 'react-router';
import { authSession } from '~/auth/session.server';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { db } from '~/db';
import { AUTH_PROVIDER, identities, users } from '~/db/schema.server';
import { verifyMagicLinkToken } from '~/lib/magic-link.server';
import type { Route } from './+types/verify';

export async function loader({ request }: Route.LoaderArgs) {
  const { email, isValid } = await verifyMagicLinkToken(request);
  if (!isValid || !email) {
    return Response.json({ error: 'Invalid token' }, { status: 400 });
  }

  const userId = await db.transaction(async (tx) => {
    let [user] = await tx
      .insert(users)
      .values({ email })
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
        provider: AUTH_PROVIDER.MAGIC_LINK,
        providerId: email,
      })
      .onConflictDoNothing();

    return user.id;
  });

  return redirect(href('/dashboard/overview'), {
    headers: {
      'Set-Cookie': await authSession.create({ request, userId }),
    },
  });
}

export default function MagicLinkErrorPage() {
  return (
    <Card className="w-full border-rose-100 bg-white/90 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">
          Magic Link Expired or Invalid
        </CardTitle>
        <CardDescription className="text-center">
          The link you used is either expired or not valid. Please request a new
          login link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-muted-foreground rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm">
          <p>
            Magic links are valid for 10 minutes for security reasons. If your
            link has expired, you'll need to request a new one.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full bg-rose-500 hover:bg-rose-600" asChild>
          <Link to={href('/auth/login')}>Return to Login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export const meta: Route.MetaDescriptors = [
  { title: 'Magic Link Verification' },
];
