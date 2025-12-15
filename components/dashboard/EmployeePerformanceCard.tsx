"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

interface EmployeePerformanceData {
  name: string;
  value: number;
  color: string;
}

interface EmployeePerformanceCardProps {
  data?: EmployeePerformanceData[];
  periodDisplay?: string;
}

export function EmployeePerformanceCard({ data = [], periodDisplay }: EmployeePerformanceCardProps) {
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    if (data && data.length > 0) {
      data.forEach((item) => {
        config[item.name] = {
          label: item.name,
          color: item.color,
        };
      });
    }
    return config;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Desepenho dos Funcionários</CardTitle>
            {periodDisplay && (
              <p className="text-xs text-muted-foreground">{periodDisplay}</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Desepenho dos Funcionários</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full max-w-[260px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

