import { useLoaderData, type ShouldRevalidateFunction } from 'react-router';
import { authSession } from '~/auth/session.server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { loadPaginationSearchParams } from '~/hooks/use-pagination';
import { loadSortSearchParams } from '~/hooks/use-sort';
import { ACTION_NAME } from '~/lib/consts';
import { clamp } from '~/lib/utils';
import {
  deleteLinkById,
  getLinksData,
  updateLinkActiveStatus,
} from '~/models/links.server';
import type { Route } from './+types/links';
import { SearchBar } from './_components/links/search';
import { LinksPagination, PerPage } from './_components/pagination';
import { LinksTable } from './_components/links/table';
import { ActiveFilters, LinkFilter } from './_components/links/filter';
import { loadLinkFiltersSearchParams } from '~/hooks/use-link-filters';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  const url = new URL(request.url);
  const sortParams = loadSortSearchParams(url.searchParams);
  const paginationSearchParams = loadPaginationSearchParams(url.searchParams);
  const filterSearchParams = loadLinkFiltersSearchParams(url.searchParams);

  const page = Math.max(paginationSearchParams.page, 1);
  const itemsPerPage = clamp({
    min: 7,
    value: paginationSearchParams.itemsPerPage,
    max: 22,
  });
  const search = url.searchParams.get('s');

  const { links, totalLinks } = await getLinksData({
    search,
    userId: user.id,
    page,
    limit: itemsPerPage,
    ...sortParams,
    ...filterSearchParams,
  });

  return { user, totalLinks, links };
}

export const ACTION = {
  UPDATE_LINK_ACTIVE_STATUS: '1',
  DELETE_LINK: '2',
} as const;

export async function action({ request }: Route.ActionArgs) {
  const user = await authSession.require(request);
  const formData = await request.formData();
  const action = formData.get(ACTION_NAME);
  const linkId = formData.get('linkId') as string; // TODO: Validate this

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

export default function DashboardLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Links</CardTitle>
        <CardDescription>Manage all your shortened links</CardDescription>
        <div className="flex items-center gap-5">
          <SearchBar />
          <LinkFilter />
        </div>
        <ActiveFilters />
      </CardHeader>
      <CardContent>
        <LinksTable />
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

export function useLinksLoaderData() {
  return useLoaderData<typeof loader>();
}
