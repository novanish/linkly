import {
  Edit,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import {
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
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
  deleteLinkById,
  getLinks,
  getTotalLinksCount,
  updateLinkActiveStatus,
} from '~/models/links.server';
import type { Route } from './+types/links';
import { DeleteDialog } from './_components/delete-links';
import { LinksPagination, PerPage } from './_components/pagination';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get('p')) || 1;
  const itemsPerPage = Number(url.searchParams.get('pp')) || 7;

  const [totalLinks, links] = await Promise.all([
    getTotalLinksCount(user.id),
    getLinks(user.id, itemsPerPage, page),
  ]);

  return { user, totalLinks, links };
}

const ACTION = {
  UPDATE_LINK_ACTIVE_STATUS: '1',
  DELETE_LINK: '2',
} as const;

export async function action({ request }: Route.ActionArgs) {
  const user = await authSession.require(request);
  const formData = await request.formData();
  const action = formData.get(ACTION_NAME);
  const linkId = formData.get('linkId') as string;
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay

  switch (action) {
    case ACTION.UPDATE_LINK_ACTIVE_STATUS: {
      const isActive = formData.get('isActive') === 'true';
      await updateLinkActiveStatus({ userId: user.id, isActive, linkId });
      return null;
    }

    case ACTION.DELETE_LINK: {
      await deleteLinkById({ userId: user.id, linkId });
      return null;
    }
  }
}

export default function DashboardLinks({ loaderData }: Route.ComponentProps) {
  const { links } = loaderData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Links</CardTitle>
        <CardDescription>Manage all your shortened links</CardDescription>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search links..."
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          <Button type="submit" size="sm" className="px-3">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
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
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Link2 className="text-muted-foreground h-8 w-8" />
                    <p className="text-muted-foreground">No links found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => {
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
                        isActive={link.isActive}
                        linkId={link.id}
                        shortUrl={shortUrl}
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
                      <CopyButton text={shortUrl} variant="outline" />
                      <ActionButton linkId={link.id} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between">
          <PerPage />
          <div className="flex items-center space-x-2">
            <LinksPagination />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = ({ formData }) => {
  return formData?.get(ACTION_NAME) !== ACTION.UPDATE_LINK_ACTIVE_STATUS;
};

export const meta: Route.MetaFunction = () => [
  { title: 'My Links - Dashboard' },
  { name: 'description', content: 'Manage your shortened links' },
];

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

  function handleChange(checked: boolean) {
    const data = {
      [ACTION_NAME]: ACTION.UPDATE_LINK_ACTIVE_STATUS,
      isActive: checked,
      linkId,
    };
    fetcher.submit(data, { method: 'POST' });
  }

  return (
    <Switch
      defaultChecked={isActive}
      onCheckedChange={handleChange}
      aria-label={`Toggle ${shortUrl} active status`}
    />
  );
}

interface ActionButtonProps {
  linkId: string;
}

function ActionButton({ linkId }: ActionButtonProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit Link
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Delete Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        actionValue={ACTION.DELETE_LINK}
        linkId={linkId}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
      />
    </>
  );
}

export function useLinksLoaderData() {
  return useLoaderData<typeof loader>();
}
