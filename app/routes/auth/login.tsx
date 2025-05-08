import { Link2, Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form, Link, redirect, useNavigation } from 'react-router';
import { Footer } from '~/components/footer';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { APP_NAME } from '~/lib/consts';
import { sendMagicLinkEmail } from '~/lib/email.server';
import { generateMagicLink } from '~/lib/magic-link.server';
import type { Route } from './+types/login';
import { authSession } from '~/auth/session.server';

export async function loader({ request }: Route.LoaderArgs) {
  await authSession.redirectIfLoggedIn(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await authSession.redirectIfLoggedIn(request);

  const formData = await request.formData();
  const email = formData.get('email')?.toString() || '';

  try {
    const magicLink = await generateMagicLink(email);
    await sendMagicLinkEmail({ email, url: magicLink });

    return { emailSent: true, email };
  } catch (error) {
    console.error('Failed to send magic link:', error);
    return { error: 'Failed to send magic link' };
  }
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const [sentMagicLink, setSentMagicLink] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const isSubmittingToMagicLink =
    isSubmitting && navigation.formData?.get('email');

  useEffect(() => {
    if (actionData?.emailSent) {
      setSentMagicLink(true);
    }
  }, [actionData?.emailSent]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 w-full border-b backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-linear-to-br from-rose-400 to-amber-300 opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-linear-to-tr from-rose-500 to-amber-200 opacity-20 blur-3xl"></div>

          <Card className="w-full border-rose-100 bg-white/90 backdrop-blur-xs">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to manage your shortened links
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {sentMagicLink ? (
                <div className="space-y-4 p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                    <Mail className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-medium">Check your inbox</h3>
                  <p className="text-muted-foreground">
                    We've sent a magic link to{' '}
                    <span className="font-semibold text-gray-800">
                      {actionData?.email}
                    </span>
                    . Click the link in the email to sign in.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSentMagicLink(false)}
                  >
                    Use a different email
                  </Button>
                </div>
              ) : (
                <>
                  <Form method="POST" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <span className="text-muted-foreground relative bg-white px-2 text-xs">
                        Choose a sign in method
                      </span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-rose-500 hover:bg-rose-600"
                      disabled={isSubmitting}
                    >
                      {isSubmittingToMagicLink ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Sign in with Magic Link
                    </Button>

                    <div className="text-muted-foreground text-xs">
                      We'll email you a magic link for a password-free sign in.
                    </div>
                  </Form>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <span className="text-muted-foreground relative bg-white px-2 text-xs">
                      Or continue with
                    </span>
                  </div>

                  <Form action="/auth/google/login">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Sign in with Google
                    </Button>
                  </Form>

                  <div className="text-muted-foreground text-xs">
                    Quick and secure sign in with your Google account.
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
