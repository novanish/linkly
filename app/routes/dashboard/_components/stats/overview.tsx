import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useOverviewLoaderData } from '../../overview';
import { formatNumber } from '~/lib/utils';

function calculateTrend(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export function OverviewStats() {
  const { stats } = useOverviewLoaderData();

  const newLinksTrend = calculateTrend(
    stats.newLinksThisMonth,
    stats.newLinksLastMonth,
  );
  const clicksThisMonthTrend = calculateTrend(
    stats.clicksThisMonth,
    stats.clicksLastMonth,
  );
  const clicksLast24HoursTrend = calculateTrend(
    stats.clicksLast24Hours,
    stats.clicksPrevious24Hours,
  );
  const weeklyClicksTrend = calculateTrend(
    stats.clicksCurrentWeek,
    stats.clicksPreviousWeek,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>New Links This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.newLinksThisMonth)}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {newLinksTrend >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {newLinksTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {newLinksTrend >= 0 ? 'Increasing' : 'Decreasing'} link creation
            {newLinksTrend >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to last month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Clicks This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.clicksThisMonth)}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {clicksThisMonthTrend >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {clicksThisMonthTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {clicksThisMonthTrend >= 0 ? 'Increasing' : 'Decreasing'} traffic
            {clicksThisMonthTrend >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to last month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Weekly Clicks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.clicksCurrentWeek)}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {weeklyClicksTrend >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {weeklyClicksTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {weeklyClicksTrend >= 0 ? 'Increasing' : 'Decreasing'} weekly
            traffic
            {weeklyClicksTrend >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to last week</div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Recent Clicks (Last 24 Hours)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.clicksLast24Hours)}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {clicksLast24HoursTrend >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {clicksLast24HoursTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {clicksLast24HoursTrend >= 0 ? 'Increasing' : 'Decreasing'} recent
            activity
            {clicksLast24HoursTrend >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Compared to previous 24 hours
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
