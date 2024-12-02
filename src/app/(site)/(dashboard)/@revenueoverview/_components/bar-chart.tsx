"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatNumber } from "@/functions/format-number";

export type ChartData = { date: string; revenue: number };

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={data}
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
          formatter={(value, name, item, index) => (
            <>
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                style={
                  {
                    "--color-bg": `var(--color-${name})`,
                  } as React.CSSProperties
                }
              />
              {chartConfig[name as keyof typeof chartConfig]?.label || name}
              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                <span className="font-normal text-muted-foreground">₹</span>
                {formatNumber(Number(value))}
              </div>
            </>
          )}
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
