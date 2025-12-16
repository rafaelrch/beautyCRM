"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/formatters";
import { getPeriodDates, type PeriodFilter } from "@/lib/date-filters";
import type { Database } from "@/types/database";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

interface FinancialChartCardProps {
  transactions: TransactionRow[];
  period: PeriodFilter;
  periodDisplay?: string;
}

// Helper para converter string de data para Date sem problemas de timezone
function parseLocalDate(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString;
  }
  if (dateString.includes("T") || dateString.includes(" ")) {
    return new Date(dateString);
  }
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function FinancialChartCard({
  transactions,
  period,
  periodDisplay,
}: FinancialChartCardProps) {
  const chartData = useMemo(() => {
    const { start, end } = getPeriodDates(period);
    
    // Criar intervalo de dias
    const days = eachDayOfInterval({ start, end });
    
    // Agrupar transações por dia
    const dataByDay = new Map<string, { receita: number; despesa: number }>();
    
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      dataByDay.set(key, { receita: 0, despesa: 0 });
    });

    transactions.forEach((t) => {
      if (t.status !== "completed") return;
      
      const transactionDate = startOfDay(parseLocalDate(t.date));
      const key = format(transactionDate, "yyyy-MM-dd");
      
      if (dataByDay.has(key)) {
        const current = dataByDay.get(key)!;
        if (t.type === "income") {
          current.receita += Number(t.amount);
        } else {
          current.despesa += Number(t.amount);
        }
      }
    });

    return Array.from(dataByDay.entries())
      .map(([date, values]) => ({
        date,
        name: format(parseISO(date), "dd/MM", { locale: ptBR }),
        receita: values.receita,
        despesa: values.despesa,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, period]);

  const totals = useMemo(() => {
    const receita = chartData.reduce((sum, d) => sum + d.receita, 0);
    const despesa = chartData.reduce((sum, d) => sum + d.despesa, 0);
    return { receita, despesa, lucro: receita - despesa };
  }, [chartData]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Financeiro</CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Receita</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(totals.receita)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Despesa</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(totals.despesa)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="mb-2 font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name === "receita" ? "Receita" : "Despesa"}:{" "}
                            {formatCurrency(Number(entry.value))}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceita)"
              />
              <Area
                type="monotone"
                dataKey="despesa"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDespesa)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
