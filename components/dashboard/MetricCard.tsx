import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  className?: string;
  periodDisplay?: string;
}

export function MetricCard({ title, value, icon, className, periodDisplay }: MetricCardProps) {
  return (
    <Card className={cn("bg-white rounded-3xl", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#f1f0fb] flex items-center justify-center text-[#3211ff]">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

