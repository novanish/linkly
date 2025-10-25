import { Loader2, Mail } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Form, useNavigation, useSubmit } from 'react-router';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import { toast } from 'sonner';
import { z } from 'zod/v4-mini';
import { authSession } from '~/auth/session.server';
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
import { useRevalidateOnInterval } from '~/hooks/use-revalidate-on-interval';
import { sendMagicLinkEmail } from '~/lib/email.server';
import { generateMagicLink } from '~/lib/magic-link.server';
import {
  rateLimiter,
  type RateLimiterOptions,
} from '~/lib/rate-limiter.server';
import { sec } from '~/lib/utils';
import type { Route } from './+types/login';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { honeypot } from '~/lib/honeypot.server';
import { SpamError } from 'remix-utils/honeypot/server';

const options: RateLimiterOptions = {
  limit: 20,
  duration: sec('1hr'),
  name: 'login',
};

export async function loader({ request }: Route.LoaderArgs) {
  await authSession.redirectIfLoggedIn(request);
  const ip = getClientIPAddress(request);
  const result = await rateLimiter.check(ip!, options);

  if (!result.isAllowed) {
    throw new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter!.toString(),
      },
    });
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  try {
    await honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response('Form not submitted properly', { status: 400 });
    }
    throw error;
  }

  await authSession.redirectIfLoggedIn(request);
  const ip = getClientIPAddress(request);
  const result = await rateLimiter.consume(ip!, options);
  if (!result.isAllowed) {
    throw new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter!.toString(),
      },
    });
  }

  const validationResult = z.email().safeParse(formData.get('email'));
  if (validationResult.error) {
    const errorMessage =
      validationResult.error.issues[0]?.message || 'Invalid email address';
    return { error: errorMessage };
  }

  try {
    const email = validationResult.data;
    const magicLink = await generateMagicLink(email);
    await sendMagicLinkEmail({ email, url: magicLink });

    return { emailSent: true, email };
  } catch (error) {
    console.error('Failed to send magic link:', error);
    return { error: 'Failed to send magic link' };
  }
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const submit = useSubmit();
  useRevalidateOnInterval({
    enabled: isMagicLinkSent,
    interval: 2000,
  });

  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const isSubmittingToMagicLink =
    isSubmitting && navigation.formData?.get('email');

  useEffect(() => {
    if (actionData?.emailSent) {
      setIsMagicLinkSent(true);
    }
  }, [actionData?.emailSent]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const { success } = z.email().safeParse(email);
    if (!success) {
      toast.error(
        'Please enter a valid email address (e.g., user@example.com)',
      );
      return;
    }

    submit(e.currentTarget);
  }

  return (
    <Card className="w-full border-rose-100 bg-white/90 backdrop-blur-xs">
      {isMagicLinkSent ? null : (
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in or create an account to manage your shortened links
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {isMagicLinkSent ? (
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
              onClick={() => setIsMagicLinkSent(false)}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <>
            <Form method="POST" className="space-y-4" onSubmit={handleSubmit}>
              {actionData?.error ? (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
                  {actionData.error}
                </div>
              ) : null}

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

              <HoneypotInputs />

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
  );
}

export const meta: Route.MetaDescriptors = [
  {
    title: 'Login',
    description: 'Sign in to your account',
  },
];
