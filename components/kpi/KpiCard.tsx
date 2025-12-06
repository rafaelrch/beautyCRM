import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  percentage?: number;
  trend?: "up" | "down";
  className?: string;
}

export function KpiCard({ title, value, percentage, trend, className }: KpiCardProps) {
  const isPositive = trend === "up" || (percentage !== undefined && percentage >= 0);
  
  return (
    <Card className={cn("bg-white rounded-xl shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          {percentage !== undefined && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-2",
                isPositive
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-red-100 text-red-700 hover:bg-red-100"
              )}
            >
              {isPositive ? "+" : ""}
              {percentage}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

