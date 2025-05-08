import { SelectTrigger } from '@radix-ui/react-select';
import { useSearchParams } from 'react-router';
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
  SelectValue,
} from '~/components/ui/select';
import { useLinksLoaderData } from '../../links';

export function PerPage() {
  const { totalLinks } = useLinksLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('p')) || 1;
  const itemsPerPage = Number(searchParams.get('pp')) || 7;
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="flex items-center space-x-2">
      <p className="text-muted-foreground text-sm">
        Showing {indexOfFirstItem + 1}-{indexOfLastItem} of {totalLinks} links
      </p>
      <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => {
          setSearchParams('p=1&pp=' + value);
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
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('p')) || 1;
  const itemsPerPage = Number(searchParams.get('pp')) || 7;
  const pagination = generatePagination(totalLinks, itemsPerPage, page);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious prefetch="intent" to={`?p=${page - 1}`} />
        </PaginationItem>

        {pagination.map((item, index) => {
          return (
            <PaginationItem key={index}>
              {item === '...' ? (
                <PaginationEllipsis key={index} />
              ) : (
                <PaginationLink
                  prefetch="intent"
                  to={`?p=${item}`}
                  isActive={item === page}
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext prefetch="intent" to={`?p=${page + 1}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function generatePagination(
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

  let rangeStart = Math.max(2, currentPage - displayedPages);
  let rangeEnd = Math.min(totalPages - 1, currentPage + displayedPages);

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
