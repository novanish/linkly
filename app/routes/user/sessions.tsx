import { isCuid } from '@paralleldrive/cuid2';
import {
  Clock,
  Globe,
  LogOut,
  Monitor,
  MoreVertical,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaEdge, FaSafari } from 'react-icons/fa';
import { FiChrome } from 'react-icons/fi';
import { TbBrandFirefox } from 'react-icons/tb';
import { Form, href, redirect, useFetcher } from 'react-router';
import { UAParser } from 'ua-parser-js';
import { authSession } from '~/auth/session.server';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
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
import { DEVICE_TYPE } from '~/lib/consts';
import { getDeviceType } from '~/models/clicks.server';
import type { Route } from './+types/sessions';

export async function loader({ request }: Route.LoaderArgs) {
  const activeSessions =
    await authSession.getAllSessionsForLoggedInUser(request);
  if (activeSessions.length === 0) {
    return redirect(href('/auth/login'));
  }

  const sessions = activeSessions.map((session) => {
    const result = UAParser(session.userAgent!);
    const deviceType = getDeviceType(result);
    const os = [result.os.name, result.os.version].filter(Boolean).join(' ');
    const device = [result.device.vendor, result.device.model]
      .filter(Boolean)
      .join(' ');

    return {
      publicId: session.publicId,
      isCurrentSession: session.isCurrentSession,
      loggedInAt: new Date(session.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      deviceType,
      device: device || os || 'Unknown Device',
      browser: result.browser.name || 'Unknown Browser',
    };
  });

  return { sessions };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const publicId = formData.get('publicId') as string;
  const isCurrentSession = formData.get('isCurrentSession') === 'true';

  if (isCurrentSession) {
    await authSession.destroy(request);
    return redirect(href('/auth/login'));
  }

  if (typeof publicId === 'string' && isCuid(publicId)) {
    await authSession.destroySessionByPublicId(publicId);
    return null;
  }

  const userId = await authSession.getUserId(request);
  if (userId) await authSession.destroyAllForUser(userId);

  return redirect(href('/auth/login'));
}

export default function SessionManager({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [sessions, setSessions] = useState(loaderData.sessions);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    data: null as null | { publicId: string; isCurrentSession: boolean },
  });

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setDialogState({ isOpen: false, data: null });
    }
  }, [fetcher.state]);

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
          <Form
            method="post"
            className="flex justify-end"
            onSubmit={(e) => {
              e.preventDefault();
              setDialogState({
                isOpen: true,
                data: null,
              });
            }}
          >
            <Button type="submit">
              <span className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Log Out from all devices</span>{' '}
              </span>
            </Button>
          </Form>

          <div className="mt-7 space-y-0">
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
                          {session.device}
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
                          className="h-7 w-7 bg-gray-100 p-0"
                          aria-label={`More options for ${session.deviceType}`}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="text-sm text-red-600 focus:bg-red-50 focus:text-red-600">
                          <Form
                            method="post"
                            onSubmit={(e) => {
                              e.preventDefault();
                              setDialogState({
                                isOpen: true,
                                data: {
                                  publicId: session.publicId,
                                  isCurrentSession: session.isCurrentSession,
                                },
                              });
                            }}
                          >
                            <input
                              type="hidden"
                              name="isCurrentSession"
                              value={String(session.isCurrentSession)}
                            />
                            <input
                              type="hidden"
                              name="publicId"
                              value={session.publicId}
                            />
                            <button
                              type="submit"
                              className="flex w-full cursor-pointer items-center space-x-2"
                            >
                              <LogOut className="mr-2 h-3.5 w-3.5" />
                              Log Out
                            </button>
                          </Form>
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

      <DeleteAlertDialog
        onOpenChange={(open) => {
          setDialogState((prev) => ({ ...prev, isOpen: open, data: null }));
        }}
        open={dialogState.isOpen}
        isLoading={fetcher.state !== 'idle'}
        onContinue={() => {
          fetcher.submit(dialogState.data, { method: 'POST' });
          if (!dialogState.data) return;

          setSessions((prev) =>
            prev.filter(
              (session) => session.publicId !== dialogState.data!.publicId,
            ),
          );
        }}
      />
    </div>
  );
}

interface DeleteAlertDialogProps {
  onContinue?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

function DeleteAlertDialog({
  onContinue,
  open,
  onOpenChange,
  isLoading,
}: DeleteAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will log out the user from the
            device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              if (!onContinue) return;
              e.preventDefault();
              onContinue();
            }}
            disabled={isLoading}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const shouldRevalidate = () => false;

export const meta: Route.MetaFunction = () => [
  { title: 'Session Management - User' },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case DEVICE_TYPE.DESKTOP:
      return <Monitor className="h-4 w-4 text-blue-600" />;
    case DEVICE_TYPE.MOBILE:
      return <Smartphone className="h-4 w-4 text-green-600" />;
    case DEVICE_TYPE.TABLET:
      return <Tablet className="h-4 w-4 text-purple-600" />;
    default:
      return <Globe className="h-4 w-4 text-gray-600" />;
  }
};

const getBrowserIcon = (browser: string) => {
  const lowerCaseBrowser = browser.toLowerCase();
  const className = 'size-3.5 text-gray-500';

  if (lowerCaseBrowser.includes('chrome')) {
    return <FiChrome className={className} />;
  }

  if (lowerCaseBrowser.includes('firefox')) {
    return <TbBrandFirefox className={className} />;
  }

  if (lowerCaseBrowser.includes('edge')) {
    return <FaEdge className={className} />;
  }

  if (lowerCaseBrowser.includes('safari')) {
    return <FaSafari className={className} />;
  }

  return <Globe className={className} />;
};
