"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { PeriodFilter } from "@/lib/date-filters";
import { eachDayOfInterval, format, isSameDay, startOfDay, addHours, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getPeriodDates } from "@/lib/date-filters";
import type { Database } from "@/types/database";

// Helper para converter string de data para Date sem problemas de timezone
function parseLocalDate(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Se a string já tem hora/timezone, usar new Date normalmente
  if (dateString.includes('T') || dateString.includes(' ')) {
    return new Date(dateString);
  }
  
  // Se for apenas data (YYYY-MM-DD), criar Date no timezone local
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

const chartConfig = {
  income: {
    label: "Entradas",
    color: "#3b82f6", // Azul
  },
  expense: {
    label: "Saídas",
    color: "#ef4444", // Vermelho
  },
};

interface FinancialChartCardProps {
  transactions?: TransactionRow[];
  period?: PeriodFilter;
  periodDisplay?: string;
}

export function FinancialChartCard({ transactions = [], period = "este-mes", periodDisplay }: FinancialChartCardProps) {
  const { start, end } = getPeriodDates(period);
  
  const displayDate = periodDisplay || (() => {
    if (period === "hoje") {
      return format(start, "dd/MM/yyyy", { locale: ptBR });
    } else {
      const startFormatted = format(start, "dd/MM", { locale: ptBR });
      const endFormatted = format(end, "dd/MM", { locale: ptBR });
      const year = format(start, "yyyy", { locale: ptBR });
      return `${startFormatted} - ${endFormatted} de ${year}`;
    }
  })();

  const chartData = useMemo(() => {
    // Visualização por hora quando o período é "hoje"
    if (period === "hoje") {
      const dayStart = startOfDay(start);
      const dayEnd = endOfDay(start);
      const hours = Array.from({ length: 24 }, (_, h) => h);

      return hours.map((hour) => {
        const windowStart = addHours(dayStart, hour);
        const windowEnd = addHours(dayStart, hour + 1);

        const hourTransactions = transactions.filter((t) => {
          // Tentar usar created_at para precisão de horário; fallback para date
          const raw = (t as any).created_at || t.date;
          const txDate = parseLocalDate(raw);
          return txDate >= windowStart && txDate < windowEnd;
        });

        const income = hourTransactions
          .filter((t) => t.type === "income" && t.status === "completed")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = hourTransactions
          .filter((t) => t.type === "expense" && t.status === "completed")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          date: `${String(hour).padStart(2, "0")}:00`,
          income,
          expense,
        };
      });
    }

    // Visualização diária para demais períodos
    const days = eachDayOfInterval({ start, end });
    
    return days.map((day) => {
      const dayTransactions = transactions.filter((t) => {
        const transactionDate = startOfDay(parseLocalDate(t.date));
        const dayStart = startOfDay(day);
        return transactionDate.getTime() === dayStart.getTime();
      });

      const income = dayTransactions
        .filter((t) => t.type === "income" && t.status === "completed")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = dayTransactions
        .filter((t) => t.type === "expense" && t.status === "completed")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        date: format(day, "dd/MM"),
        income,
        expense,
      };
    });
  }, [transactions, start, end, period]);
  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Financeiro</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              fillOpacity={0.6}
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Area
              dataKey="expense"
              type="natural"
              fill="url(#fillExpense)"
              fillOpacity={0.6}
              stroke="#ef4444"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span className="text-sm text-muted-foreground">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-sm text-muted-foreground">Saídas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

