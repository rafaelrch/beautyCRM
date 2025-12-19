"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  periodDisplay?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  periodDisplay,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card 
      className={cn("h-full relative overflow-hidden py-0 gap-0 ", className)}
      style={{
        background: 'radial-gradient(circle at top right, rgba(67, 46, 255, 0.05) 0%, rgba(219, 234, 254, 0.1) 50%, transparent 80%)',
      }}
      >
      <CardContent className="p-4 py-2 relative z-10 h-full flex flex-col justify-center">
        <div className="space-y-1 flex flex-col items-start">
          <div className="flex items-center gap-2">
            <div className="p-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/6 text-primary relative z-10 flex-shrink-0">
              {icon}
            </div>
            <p className="text-lg font-light tracking-tighter text-black">{title}</p>
          </div>
          <p className="text-3xl font-bold tracking-tighter text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs período anterior
              </span>
            </div>
          )}
        </div>
      </CardContent>
      </Card>
  );
}
