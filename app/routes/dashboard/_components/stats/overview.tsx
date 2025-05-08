import { BarChart2, Clock, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { getPercentageChange } from '~/lib/utils';
import { useOverviewLoaderData } from '../../overview';

export function OverviewStats() {
  const { weeklyLinkStats, linkClickStats, totalClicksInLast24Hours } =
    useOverviewLoaderData();
  const isIncreaseInClicks =
    linkClickStats.thisMonth > linkClickStats.lastMonth;
  const percentageChange = getPercentageChange(
    linkClickStats.lastMonth,
    linkClickStats.thisMonth,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Links</CardTitle>
          <Link2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyLinkStats.thisWeek}</div>
          <p className="text-muted-foreground text-xs">
            +{weeklyLinkStats.thisWeek - weeklyLinkStats.lastWeek} from last
            week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <BarChart2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{linkClickStats.thisMonth}</div>
          {percentageChange ? (
            <p className="text-muted-foreground text-xs">
              %{percentageChange} {isIncreaseInClicks ? 'increase' : 'decrease'}{' '}
              from last month
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalClicksInLast24Hours}{' '}
            {totalClicksInLast24Hours > 1 ? 'Clicks' : 'Click'}
          </div>
          <p className="text-muted-foreground text-xs">In the last 24 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
