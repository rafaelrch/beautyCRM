"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface PerformanceData {
  name: string;
  value: number;
  color: string;
}

interface EmployeePerformanceCardProps {
  data: PerformanceData[];
  periodDisplay?: string;
}

export function EmployeePerformanceCard({
  data,
  periodDisplay,
}: EmployeePerformanceCardProps) {
  // Ordenar por valor (maior para menor)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Total de atendimentos
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Desempenho Profissionais
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {total} atendimentos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum atendimento no período
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedData.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {item.value} atend.
                      </span>
                      <span className="font-semibold text-xs w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
