// TODO: Improve the session management UI by adding a logout button for each session, making device type and browser more informative, handle loading states and also handle case where there are no user agents available.

import { authSession } from '~/auth/session.server';
import { Form, href, redirect } from 'react-router';
import { UAParser } from 'ua-parser-js';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Separator } from '~/components/ui/separator';
import {
  Monitor,
  Smartphone,
  Tablet,
  MoreVertical,
  LogOut,
  Clock,
  Chrome,
  Globe,
} from 'lucide-react';
import type { Route } from './+types/sessions';

export async function loader({ request }: Route.LoaderArgs) {
  const activeSessions =
    await authSession.getAllSessionsForLoggedInUser(request);
  if (activeSessions.length === 0) {
    return redirect(href('/auth/login'));
  }

  const sessions = activeSessions.map((session, index) => {
    // TODO: Handle null userAgent
    const result = UAParser(session.userAgent!);

    return {
      publicId: index, // TODO: Store publicId in session and use it here
      isCurrentSession: session.isCurrentSession,
      loggedInAt: new Date(session.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      deviceType: result.device.model || result.os.name || 'Unknown Device',
      browser: result.browser.name || 'Unknown Browser',
    };
  });

  return { sessions };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await authSession.getUserId(request);
  if (userId) await authSession.destroyAllForUser(userId);
  return redirect(href('/'));
}

export default function SessionManager({ loaderData }: Route.ComponentProps) {
  const { sessions } = loaderData;

  return (
    <div className="mx-auto max-w-3xl min-w-[90%] space-y-4 p-4">
      <Card className="mx-auto max-w-xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Where You're Logged In
          </CardTitle>
          <p className="mt-1 text-sm text-gray-600">
            Here's a list of all devices where you are currently logged in.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <Form method="post" className="flex justify-end">
            <Button type="submit">
              <span className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Log Out from all devices</span>{' '}
                {/* TODO: Add confirmation dialog before deleteing */}
              </span>
            </Button>
          </Form>

          <div className="space-y-0">
            {sessions.map((session, index) => (
              <div key={session.publicId}>
                <div className="group flex items-center justify-between rounded-md px-1 py-3 transition-colors hover:bg-gray-50">
                  <div className="flex min-w-0 flex-1 items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getPlatformIcon(session.deviceType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="truncate text-sm font-medium text-gray-900">
                          {session.deviceType}
                        </h3>
                        {session.isCurrentSession && (
                          <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 px-1.5 py-0 text-xs text-blue-600"
                          >
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1.5">
                            {getBrowserIcon(session.browser)}
                            <span className="truncate">{session.browser}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {session.loggedInAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-3 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                          aria-label={`More options for ${session.deviceType}`}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="text-sm text-red-600 focus:bg-red-50 focus:text-red-600"
                          disabled={session.isCurrentSession}
                        >
                          <LogOut className="mr-2 h-3.5 w-3.5" />
                          Log Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {index < sessions.length - 1 && <Separator className="my-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'desktop':
      return <Monitor className="h-4 w-4 text-blue-600" />;
    case 'mobile':
      return <Smartphone className="h-4 w-4 text-green-600" />;
    case 'tablet':
      return <Tablet className="h-4 w-4 text-purple-600" />;
    default:
      return <Globe className="h-4 w-4 text-gray-600" />;
  }
};

const getBrowserIcon = (browser: string) => {
  if (browser.toLowerCase().includes('chrome')) {
    return <Chrome className="h-3.5 w-3.5 text-gray-500" />;
  }
  return <Globe className="h-3.5 w-3.5 text-gray-500" />;
};
