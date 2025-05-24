import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { usePagination } from '~/hooks/use-pagination';
import { useLinksLoaderData } from '../../links';

export function PerPage() {
  const { totalLinks } = useLinksLoaderData();
  const { pagination, setPagination } = usePagination();
  const { page, itemsPerPage } = pagination;
  const indexOfLastItem = Math.min(page * itemsPerPage, totalLinks);
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  if (totalLinks <= itemsPerPage) return null;

  return (
    <div className="flex items-center space-x-2">
      <p className="text-muted-foreground text-sm">
        Showing {indexOfFirstItem + 1}-{indexOfLastItem} of {totalLinks} links
      </p>
      <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => {
          const firstItemPosition = (page - 1) * itemsPerPage + 1;
          const newPage = Math.ceil(firstItemPosition / Number(value));
          setPagination({
            itemsPerPage: Number(value),
            page: newPage,
          });
        }}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder="7" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="20">20</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">per page</p>
    </div>
  );
}

export function LinksPagination() {
  const { totalLinks } = useLinksLoaderData();
  const { pagination, serialize } = usePagination();
  const { page, itemsPerPage } = pagination;
  const paginationPages = generatePaginationPages(
    totalLinks,
    itemsPerPage,
    page,
  );

  if (totalLinks <= itemsPerPage) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            prefetch="intent"
            to={{ search: serialize({ page: page - 1 }) }}
            replace
            preventScrollReset
          />
        </PaginationItem>

        {paginationPages.map((item, index) => {
          return (
            <PaginationItem key={index}>
              {item === '...' ? (
                <PaginationEllipsis key={index} />
              ) : (
                <PaginationLink
                  prefetch="intent"
                  to={{
                    search: serialize({ page: item }),
                  }}
                  isActive={item === page}
                  replace
                  preventScrollReset
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            prefetch="intent"
            to={{ search: serialize({ page: page + 1 }) }}
            replace
            preventScrollReset
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function generatePaginationPages(
  totalItems: number,
  itemsPerPage: number,
  currentPage: number = 1,
  displayedPages: number = 2,
): (number | '...')[] {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalItems <= 0 || itemsPerPage <= 0) {
    return [];
  }

  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const pagination: (number | '...')[] = [];

  pagination.push(1);

  const rangeStart = Math.max(2, currentPage - displayedPages);
  const rangeEnd = Math.min(totalPages - 1, currentPage + displayedPages);

  if (rangeStart > 2) {
    pagination.push('...');
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pagination.push(i);
  }

  if (rangeEnd < totalPages - 1) {
    pagination.push('...');
  }

  if (totalPages > 1) {
    pagination.push(totalPages);
  }

  return pagination;
}
