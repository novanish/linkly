import { useLoaderData } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { authSession } from '~/auth/session.server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import {
  calculateTrafficSourcePercentages,
  getClickActivityByHour,
  getClickActivityLast7Days,
} from '~/models/clicks.server';
import type { Route } from './+types/analytics';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  const [clickActivity, trafficSourcePercentages, clickActivityByHour] =
    await Promise.all([
      getClickActivityLast7Days(user.id),
      calculateTrafficSourcePercentages(user.id),
      getClickActivityByHour(user.id),
    ]);

  return {
    clickActivity,
    trafficSourcePercentages,
    clickActivityByHour,
  };
}

export default function AnalyticsPage() {
  return (
    <>
      <TrafficSourceBarChart />

      <div className="grid gap-4 lg:grid-cols-2">
        <TimeOfDayAnalysis />
        <ClickActivityLast7Days />
      </div>
    </>
  );
}

function TrafficSourceBarChart() {
  const { trafficSourcePercentages } = useLoaderData<typeof loader>();
  const referrerData = Object.entries(trafficSourcePercentages).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
      value,
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Where your link clicks are coming from
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: 'Percentage',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={referrerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis dataKey="value" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ClickActivityLast7Days() {
  const { clickActivity } = useLoaderData<typeof loader>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Click Activity</CardTitle>
        <CardDescription>Click activity over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            clicks: {
              label: 'Clicks',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clickActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="var(--color-clicks)"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TimeOfDayAnalysis() {
  const { clickActivityByHour } = useLoaderData<typeof loader>();
  console.log('clickActivityByHour', clickActivityByHour);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time of Day Analysis</CardTitle>
        <CardDescription>
          When your links receive the most clicks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            clicks: {
              label: 'Clicks',
              color: 'hsl(var(--chart-4))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clickActivityByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="var(--color-clicks)"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
