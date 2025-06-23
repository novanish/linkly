import { CalendarIcon, SlidersHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { PHISHING_STATUS } from '~/lib/consts';
import { MultiSelect } from '~/components/ui/multi-select';
import { Label } from '~/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import { cn } from '~/lib/utils';
import { format } from 'date-fns';
import { useLinkFilters } from '~/hooks/use-link-filters';
import { Badge } from '~/components/ui/badge';
import { usePagination } from '~/hooks/use-pagination';

const phishingStatusOptions = [
  { label: 'Phishing', value: PHISHING_STATUS.PHISHING },
  { label: 'Suspicious', value: PHISHING_STATUS.SUSPICIOUS },
  { label: 'Safe', value: PHISHING_STATUS.SAFE },
];

const activeStatusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

export function LinkFilter() {
  const [filter, setFilter] = useLinkFilters();
  const { setPagination } = usePagination();

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <SlidersHorizontal className="text-primary" />
            <span className="sr-only">Filter Links</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              Filter Links
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded">
                <div className="bg-primary h-2 w-2 rounded-full" />
              </div>
              <h3 className="font-medium text-gray-900">Status</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Active Status
                </Label>
                <MultiSelect
                  // @ts-expect-error TODO: fix this later
                  defaultValue={filter.isActive || []}
                  onValueChange={(value) => {
                    const shouldClear = value.length === 0;

                    setFilter({
                      // @ts-expect-error TODO: fix this later
                      isActive: shouldClear ? null : value,
                    });

                    setPagination({
                      page: 1,
                    });
                  }}
                  // @ts-expect-error TODO: fix this later
                  options={activeStatusOptions}
                  placeholder="Select status"
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Phishing Status
                </Label>
                <MultiSelect
                  defaultValue={filter.phishingStatus || []}
                  onValueChange={(value) => {
                    const shouldClear = value.length === 0;

                    setFilter({
                      // @ts-expect-error TODO: fix this later
                      phishingStatus: shouldClear ? null : value,
                    });

                    setPagination({
                      page: 1,
                    });
                  }}
                  options={phishingStatusOptions}
                  placeholder="Select status"
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-primary h-5 w-5" />
              <h3 className="font-medium text-gray-900">Date Range</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  From Date
                </Label>

                <DatePicker
                  value={filter.from}
                  onSelect={(date) => {
                    setFilter({ from: date });
                    setPagination({
                      page: 1,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  To Date
                </Label>

                <DatePicker
                  value={filter.to}
                  onSelect={(date) => {
                    setFilter({ to: date });
                    setPagination({
                      page: 1,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ActiveFilters() {
  const [filter, setFilter] = useLinkFilters();

  const hasFilters = Object.values(filter).some(Boolean);
  if (!hasFilters) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          Active filters:
        </span>
        {filter.isActive?.length
          ? activeStatusOptions.map((option) => {
              const isIncluded = filter.isActive?.includes(option.value);
              if (!isIncluded) return null;

              return (
                <Badge
                  key={option.label}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-1 pr-1 text-white"
                >
                  {option.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-white hover:bg-white/20"
                    onClick={() => {
                      const newActive = filter.isActive?.filter(
                        (value) => value !== option.value,
                      );
                      setFilter({
                        isActive: newActive?.length === 0 ? null : newActive,
                      });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          : null}

        {filter.phishingStatus?.length
          ? phishingStatusOptions.map((option) => {
              const isIncluded = filter.phishingStatus?.includes(option.value);
              if (!isIncluded) return null;

              return (
                <Badge
                  key={option.label}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-1 pr-1 text-white"
                >
                  {option.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-white hover:bg-white/20"
                    onClick={() => {
                      const newPhishingStatus = filter.phishingStatus?.filter(
                        (value) => value !== option.value,
                      );
                      setFilter({
                        phishingStatus:
                          newPhishingStatus?.length === 0
                            ? null
                            : newPhishingStatus,
                      });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          : null}

        {filter.from ? (
          <Badge className="bg-primary hover:bg-primary/90 flex items-center gap-1 pr-1 text-white">
            From: {format(filter.from, 'PPP')}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-white hover:bg-white/20"
              onClick={() => {
                setFilter({ from: null });
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ) : null}

        {filter.to ? (
          <Badge className="bg-primary hover:bg-primary/90 flex items-center gap-1 pr-1 text-white">
            To: {format(filter.to, 'PPP')}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-white hover:bg-white/20"
              onClick={() => {
                setFilter({ to: null });
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ) : null}

        {/* {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.type}-${filter.value}-${index}`}
              className="bg-primary hover:bg-primary/90 flex items-center gap-1 pr-1 text-white"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-white hover:bg-white/20"
                onClick={() => removeFilter(filter.type, filter.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))} */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter(null)}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          Clear All
        </Button>
      </div>
    </>
  );
}

interface DatePickerProps {
  value: Date | undefined | null;
  onSelect: (date: Date | undefined) => void;
}

export function DatePicker({ value, onSelect }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
