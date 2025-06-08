import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Home,
  Link2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, redirect } from 'react-router';
import { Footer } from '~/components/footer';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { APP_NAME, PHISHING_STATUS } from '~/lib/consts';
import { getOriginalUrl } from '~/models/links.server';
import type { Route } from './+types/index';
import { recordClickAnalytics } from '~/models/clicks.server';

export async function loader({ request, params }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isShortCodeRedirect = url.pathname.startsWith('/s/');
  const link = await getOriginalUrl(params.shortCode, isShortCodeRedirect);
  if (!link) {
    throw new Response('Not Found', { status: 404 });
  }

  if (link.trackClicks) void recordClickAnalytics(request, link.id);
  if (link.phishingStatus === PHISHING_STATUS.SAFE)
    return redirect(link.originalUrl);

  return {
    destination: link.originalUrl,
    phishingStatus: link.phishingStatus,
  };
}

export default function PhishingWarningPage({
  loaderData,
}: Route.ComponentProps) {
  const [showDetails, setShowDetails] = useState(true);
  const { destination, phishingStatus } = loaderData;
  const { color, title, description } = getPhishingStatusMeta(phishingStatus);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-red-400 to-amber-300 opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-gradient-to-tr from-red-500 to-amber-200 opacity-20 blur-3xl"></div>

          <Card className="w-full border-red-100 bg-white/90 backdrop-blur-sm">
            <CardHeader className={`${color} rounded-t-lg py-4 text-white`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8" />
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              </div>
              <CardDescription className="text-base text-white/90">
                {description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <Alert variant="destructive" className="border-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Alert</AlertTitle>
                <AlertDescription>
                  {APP_NAME} has detected that this URL may be attempting to
                  steal your personal information.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">
                    You are trying to visit:
                  </h3>
                  <p className="text-base font-medium break-all">
                    {destination}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-muted-foreground"
                  >
                    {showDetails ? 'Hide details' : 'Show details'}
                  </Button>

                  {showDetails && (
                    <div className="bg-muted/50 mt-4 space-y-2 rounded-md p-4 text-sm">
                      <p>
                        <strong>What is phishing?</strong> Phishing is a type of
                        online scam where criminals impersonate legitimate
                        organizations to steal sensitive information like
                        passwords or credit card details.
                      </p>
                      <p>
                        <strong>Why was this detected?</strong> Our security
                        system analyzes URLs for characteristics commonly
                        associated with phishing attempts, such as misleading
                        domain names, suspicious keywords, or known malicious
                        patterns.
                      </p>
                      <p>
                        <strong>What should I do?</strong> We recommend
                        returning to safety. If you believe this is a false
                        detection, you can proceed at your own risk, but be
                        extremely cautious about entering any personal
                        information.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button
                className="w-full flex-1 bg-rose-500 hover:bg-rose-600 sm:w-auto"
                asChild
              >
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Safety
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full flex-1 border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
                asChild
              >
                <a href={destination} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Proceed at Your Own Risk
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 opacity-10 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-gradient-to-tr from-rose-500 to-amber-200 opacity-10 blur-3xl"></div>

          <div className="relative z-10 space-y-8 text-center">
            <div className="relative mx-auto h-24 w-24">
              <div className={`absolute inset-0 transition-all duration-700`}>
                <div className="flex h-full w-full items-center justify-center">
                  <div className="relative">
                    <AlertCircle className="h-20 w-20 text-rose-100" />
                    <AlertCircle
                      className={`absolute top-0 left-0 h-20 w-20 text-rose-500 transition-opacity duration-1000`}
                      strokeWidth={1.5}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-2xl font-bold text-rose-500">
                      !
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold">Link Not Available</h1>

            <p className="text-muted-foreground mx-auto max-w-sm">
              The shortened link you're trying to access doesn't exist, has
              expired, or has been deactivated by its owner.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="bg-rose-500 hover:bg-rose-600"
                size="lg"
                asChild
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getPhishingStatusMeta(
  status: (typeof PHISHING_STATUS)[keyof typeof PHISHING_STATUS],
) {
  switch (status) {
    case PHISHING_STATUS.SUSPICIOUS:
      return {
        color: 'bg-amber-500',
        title: 'Suspicious URL Detected',
        description:
          'This link has some characteristics that may indicate phishing. Proceed with caution.',
      };

    case PHISHING_STATUS.PHISHING:
    default:
      return {
        color: 'bg-red-500',
        title: 'Phishing Attempt Detected',
        description:
          'This link has been identified as a potential phishing attempt. We strongly advise against proceeding.',
      };
  }
}
