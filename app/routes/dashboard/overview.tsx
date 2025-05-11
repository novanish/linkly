import { ExternalLink } from 'lucide-react';
import {
  Link,
  useFetcher,
  useLoaderData,
  type ShouldRevalidateFunction,
} from 'react-router';
import { authSession } from '~/auth/session.server';
import { PhishingStatusBadge } from '~/components/badge/phishing-status';
import { CopyButton } from '~/components/buttons/copy';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Switch } from '~/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { ACTION_NAME } from '~/lib/consts';
import { getShortUrl } from '~/lib/utils';
import {
  getTopLinks,
  getUserStats,
  updateLinkActiveStatus,
} from '~/models/links.server';
import type { Route } from './+types/overview';
import { OverviewStats } from './_components/stats/overview';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);

  const [topLinks, stats] = await Promise.all([
    getTopLinks(user.id),
    getUserStats(user.id),
  ]);

  return {
    topLinks,
    stats,
  };
}

const ACTION = {
  UPDATE_LINK_ACTIVE_STATUS: '1',
} as const;

export async function action({ request }: Route.ActionArgs) {
  const user = await authSession.require(request);
  const formData = await request.formData();
  const action = formData.get(ACTION_NAME);

  switch (action) {
    case ACTION.UPDATE_LINK_ACTIVE_STATUS: {
      const isActive = formData.get('isActive') === 'on';
      const linkId = formData.get('linkId') as string;
      await updateLinkActiveStatus({ userId: user.id, isActive, linkId });
      return null;
    }
  }
}

export default function DashboardOverview({
  loaderData,
}: Route.ComponentProps) {
  const { topLinks } = loaderData;

  return (
    <>
      <OverviewStats />
      <Card>
        <CardHeader>
          <CardTitle>Top Links</CardTitle>
          <CardDescription>
            Here are your top links based on the number of clicks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Short URL</TableHead>
                <TableHead>Original URL</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Phishing Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topLinks.map((link) => {
                const shortUrl = getShortUrl({
                  shortCode: link.shortCode,
                  customAlias: link.customAlias,
                });

                return (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{shortUrl}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {link.clicksCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <ActiveStatusSwitch
                        shortUrl={shortUrl}
                        isActive={link.isActive}
                        linkId={link.id}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <PhishingStatusBadge
                          status={link.phishingStatus}
                          showLabel={true}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CopyButton text={shortUrl} variant="outline" />
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard/links" prefetch="intent">
                View All Links
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

interface ActiveStatusSwitchProps {
  shortUrl: string;
  isActive: boolean;
  linkId: string;
}

function ActiveStatusSwitch({
  shortUrl,
  isActive,
  linkId,
}: ActiveStatusSwitchProps) {
  const fetcher = useFetcher();
  const active = fetcher.formData
    ? fetcher.formData.get('isActive') === 'on'
    : isActive;

  return (
    <fetcher.Form method="POST">
      <input
        type="hidden"
        name={ACTION_NAME}
        value={ACTION.UPDATE_LINK_ACTIVE_STATUS}
      />
      <input type="hidden" name="linkId" value={linkId} />
      <Switch
        type="submit"
        name="isActive"
        defaultChecked={active}
        aria-label={`Toggle ${shortUrl} active status`}
      />
    </fetcher.Form>
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formData }) => {
  const action = formData?.get(ACTION_NAME);
  return action !== ACTION.UPDATE_LINK_ACTIVE_STATUS;
};

export function useOverviewLoaderData() {
  return useLoaderData<typeof loader>();
}
