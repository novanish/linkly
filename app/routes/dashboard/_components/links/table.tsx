import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  EyeIcon,
  Link2,
  MoreHorizontal,
  QrCode,
} from 'lucide-react';
import { useState } from 'react';
import { href, Link, useFetcher } from 'react-router';
import { PhishingStatusBadge } from '~/components/badge/phishing-status';
import { CopyButton } from '~/components/buttons/copy';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Switch } from '~/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { useSort } from '~/hooks/use-sort';
import { ACTION_NAME } from '~/lib/consts';
import { getShortUrl } from '~/lib/utils';
import { ACTION, useLinksLoaderData } from '../../links';
import { DeleteDialog } from '../delete-links';

type Column = {
  key: string;
  header: string;
  sortable: boolean;
  className?: string | undefined;
};

const COLUMNS = [
  {
    key: 'shortUrl',
    header: 'Short URL',
    sortable: false,
    className: undefined,
  },
  {
    key: 'originalUrl',
    header: 'Original URL',
    sortable: false,
    className: undefined,
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    className: 'hidden md:table-cell',
  },
  {
    key: 'clicksCount',
    header: 'Clicks',
    sortable: true,
    className: 'text-right',
  },
  {
    key: 'isActive',
    header: 'Status',
    sortable: true,
    className: 'text-center',
  },
  {
    key: 'phishingStatus',
    header: 'Phishing Status',
    sortable: true,
    className: 'text-center',
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    className: 'text-right',
  },
] as const satisfies Array<Column>;

export function LinksTable() {
  const { links } = useLinksLoaderData();
  const [sortConfig, setSortConfig] = useSort();

  const getIcon = (col: Column) => {
    if (!col.sortable) return null;

    if (col.key === sortConfig.orderBy) {
      return sortConfig.orderDirection === 'asc' ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }

    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((column) => {
            const isSortable = column.sortable;
            const icon = getIcon(column);

            return (
              <TableHead key={column.key} className={column.className}>
                {isSortable ? (
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => {
                      setSortConfig({
                        orderBy: column.key,
                        orderDirection:
                          sortConfig.orderBy === column.key &&
                          sortConfig.orderDirection === 'asc'
                            ? 'desc'
                            : 'asc',
                      });
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {column.header} {icon}
                    </span>
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            );
          })}
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
                <TableCell className="text-right">{link.clicksCount}</TableCell>
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
                  <ActionButton linkId={link.id} url={shortUrl} />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
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
  url: string;
}

function ActionButton({ linkId, url }: ActionButtonProps) {
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
          <DropdownMenuItem asChild>
            <Link to={{ pathname: href(`/link/qr`), search: '?url=' + url }}>
              <QrCode className="mr-2 h-4 w-4" />
              Qr Code
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={href('/link/edit/:linkId', { linkId })}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Link
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to={href('/dashboard/analytics/:linkId?', { linkId })}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View Analytics
            </Link>
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
