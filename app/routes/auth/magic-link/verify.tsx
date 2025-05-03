import { Link, redirect, type LoaderFunctionArgs } from 'react-router';
import { db } from '~/db';
import { AUTH_PROVIDER, identities, users } from '~/db/schema.server';
import { AlertCircle, Link2 } from 'lucide-react';
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
import { verifyMagicLinkToken } from '~/lib/magic-link.server';
import { Footer } from '~/components/footer';
import { APP_NAME } from '~/lib/consts';

export async function loader({ request }: LoaderFunctionArgs) {
  const { email, isValid } = await verifyMagicLinkToken(request);
  if (!isValid || !email) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 400,
    });
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

  return redirect('/', {
    headers: {
      'Set-Cookie': await authSession.create({ userId }),
    },
  });
}

export default function MagicLinkErrorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 opacity-10 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-gradient-to-tr from-rose-500 to-amber-200 opacity-10 blur-3xl"></div>

          <Card className="w-full border-rose-100 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <AlertCircle className="h-8 w-8 text-rose-500" />
              </div>
              <CardTitle className="text-center text-2xl font-bold">
                Magic Link Expired or Invalid
              </CardTitle>
              <CardDescription className="text-center">
                The link you used is either expired or not valid. Please request
                a new login link.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-muted-foreground rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm">
                <p>
                  Magic links are valid for 10 minutes for security reasons. If
                  your link has expired, you'll need to request a new one.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full bg-rose-500 hover:bg-rose-600" asChild>
                <Link to="/auth/login">Return to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
