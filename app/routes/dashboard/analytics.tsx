import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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
  type ChartConfig,
} from '~/components/ui/chart';
import { Skeleton } from '~/components/ui/skeleton';
import { useRevalidateOnInterval } from '~/hooks/use-revalidate-on-interval';
import { DEVICE_TYPE } from '~/lib/consts';
import {
  calculateTrafficSourcePercentages,
  getClickActivityByHour,
  getClickActivityLast7Days,
  getDeviceAnalytics,
} from '~/models/clicks.server';
import type { Route } from './+types/analytics';

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await authSession.require(request);
  const linkId = params.linkId;
  const trafficSourcePercentages = calculateTrafficSourcePercentages(
    user.id,
    linkId,
  );

  const deviceAnalytics = getDeviceAnalytics(user.id, linkId);
  const [clickActivity, clickActivityByHour] = await Promise.all([
    getClickActivityLast7Days(user.id, linkId),
    getClickActivityByHour(user.id, linkId),
  ]);

  return {
    clickActivity,
    trafficSourcePercentages,
    clickActivityByHour,
    deviceAnalytics,
  };
}

export default function AnalyticsPage() {
  useRevalidateOnInterval({
    enabled: true,
    interval: 7000,
  });

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <TimeOfDayAnalysis />
        <ClickActivityLast7Days />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficSourceBarChart />
        <DeviceAnalyticsChart />
      </div>
    </>
  );
}

const chartConfig = {
  value: {
    label: 'Source',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

function TrafficSourceBarChart() {
  const { trafficSourcePercentages } = useLoaderData<typeof loader>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Sources</CardTitle>
        <CardDescription>
          Where your link clicks are coming from
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
          <Await resolve={trafficSourcePercentages}>
            {(data) => {
              const referrerData = Object.entries(data).map(([key, value]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
                value,
              }));

              return (
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={referrerData}
                    layout="vertical"
                    barSize={70}
                  >
                    <XAxis type="number" dataKey="value" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="value" fill="var(--color-value)" radius={5} />
                  </BarChart>
                </ChartContainer>
              );
            }}
          </Await>
        </Suspense>
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
              color: 'var(--chart-1)',
            },
          }}
        >
          <ResponsiveContainer>
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
              color: 'var(--chart-4)',
            },
          }}
        >
          <ResponsiveContainer>
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

function DeviceAnalyticsChart() {
  const { deviceAnalytics } = useLoaderData<typeof loader>();

  const deviceConfig = {
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
    tablet: {
      label: 'Tablet',
      color: 'var(--chart-3)',
    },
    unknown: {
      label: 'Unknown',
      color: 'var(--chart-4)',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Analytics</CardTitle>
        <CardDescription>Breakdown of clicks by device type</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
          <Await resolve={deviceAnalytics}>
            {(data) => {
              const deviceData = [
                {
                  device: DEVICE_TYPE.DESKTOP,
                  percentage: data[DEVICE_TYPE.DESKTOP],
                  fill: deviceConfig.desktop.color,
                },
                {
                  device: DEVICE_TYPE.MOBILE,
                  percentage: data[DEVICE_TYPE.MOBILE],
                  fill: deviceConfig.mobile.color,
                },
                {
                  device: DEVICE_TYPE.TABLET,
                  percentage: data[DEVICE_TYPE.TABLET],
                  fill: deviceConfig.tablet.color,
                },
                {
                  device: DEVICE_TYPE.UNKNOWN,
                  percentage: data[DEVICE_TYPE.UNKNOWN],
                  fill: deviceConfig.unknown.color,
                },
              ].filter((item) => item.percentage > 0);

              if (deviceData.length === 0) {
                return (
                  <div className="text-muted-foreground flex h-96 items-center justify-center">
                    No device data available
                  </div>
                );
              }

              return (
                <ChartContainer config={deviceConfig}>
                  <PieChart>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background rounded-lg border p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: data.fill }}
                                  />
                                  <span className="font-medium capitalize">
                                    {data.device}
                                  </span>
                                </div>
                                <span className="font-mono font-medium">
                                  {data.percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) =>
                        `${device.charAt(0).toUpperCase() + device.slice(1)}: ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              );
            }}
          </Await>
        </Suspense>
      </CardContent>
    </Card>
  );
}

export const meta: Route.MetaFunction = () => [
  { title: 'Analytics - Dashboard' },
  { name: 'description', content: 'Link analytics and statistics' },
];
