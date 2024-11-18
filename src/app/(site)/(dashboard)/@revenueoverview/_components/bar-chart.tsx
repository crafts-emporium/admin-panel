"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateFormat } from "@/functions/date";

const chartData = [
  { date: "2023-01-01", revenue: 186 },
  { date: "2023-01-02", revenue: 305 },
  { date: "2023-01-03", revenue: 237 },
  { date: "2023-01-04", revenue: 73 },
  { date: "2023-01-05", revenue: 209 },
  { date: "2023-01-06", revenue: 214 },
  { date: "2023-01-07", revenue: 186 },
];

export type ChartData = { from: string; to?: string; revenue: number };

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RevenueChart() {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", { weekday: "short" })
          }
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8}>
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
