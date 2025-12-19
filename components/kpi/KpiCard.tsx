import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  percentage?: number;
  trend?: "up" | "down";
  className?: string;
  icon?: ReactNode;
}

// Ícone de calendário/agendamentos (bar chart style)
const CalendarIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="calendarGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF8A50" />
        <stop offset="100%" stopColor="#FFB88C" />
      </linearGradient>
      <linearGradient id="calendarGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF9D6B" />
        <stop offset="100%" stopColor="#FFC9A3" />
      </linearGradient>
      <linearGradient id="calendarGradient3" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FFB88C" />
        <stop offset="100%" stopColor="#FFD4B8" />
      </linearGradient>
    </defs>
    <rect x="18" y="28" width="10" height="32" rx="2" fill="url(#calendarGradient1)" />
    <rect x="32" y="22" width="10" height="38" rx="2" fill="url(#calendarGradient2)" />
    <rect x="46" y="32" width="10" height="28" rx="2" fill="url(#calendarGradient3)" />
  </svg>
);

// Ícone de faturamento/receita (line graph style)
const RevenueIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="revenueGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF8A50" />
        <stop offset="100%" stopColor="#FFB88C" />
      </linearGradient>
      <linearGradient id="revenueGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF9D6B" />
        <stop offset="100%" stopColor="#FFC9A3" />
      </linearGradient>
    </defs>
    <path
      d="M12 52 L22 48 L32 38 L42 43 L52 28 L62 33"
      stroke="url(#revenueGradient1)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12 52 L22 48 L32 38 L42 43 L52 28 L62 33"
      stroke="url(#revenueGradient2)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.7"
      transform="translate(0, 6)"
    />
  </svg>
);

// Ícone de clientes (donut chart style)
const ClientsIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="clientsGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF8A50" />
        <stop offset="100%" stopColor="#FFB88C" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="26" fill="none" stroke="#E8D5C4" strokeWidth="5" />
    <path
      d="M 40 14 A 26 26 0 0 1 40 66"
      fill="none"
      stroke="url(#clientsGradient1)"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M 40 14 A 26 26 0 1 1 22 52"
      fill="none"
      stroke="#D4C4B0"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export function KpiCard({ title, value, percentage, trend, className, icon }: KpiCardProps) {
  const isPositive = trend === "up" || (percentage !== undefined && percentage >= 0);
  
  return (
    <Card className={cn("bg-white rounded-xl", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
            {percentage !== undefined && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">vs last month</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs px-2 py-0.5",
                    isPositive
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  )}
                >
                  {isPositive ? "↑" : "↓"} {Math.abs(percentage)}%
                </Badge>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 ml-4 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { CalendarIcon, RevenueIcon, ClientsIcon };

