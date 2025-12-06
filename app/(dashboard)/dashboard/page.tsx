"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi/KpiCard";
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Pie, PieChart, Cell } from "recharts";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { storage, initializeStorage } from "@/lib/storage";
import { mockClients, mockServices, mockTransactions, mockAppointments, mockProducts, mockMovements, mockSalonConfig } from "@/data";
import { mockProfissionais } from "@/data/professionals";
import { isSameDay, startOfMonth, subDays, eachDayOfInterval, endOfMonth, format } from "date-fns";
import type { Transaction, Appointment, Product, Client } from "@/types";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with mock data
    initializeStorage({
      clients: mockClients,
      services: mockServices,
      transactions: mockTransactions,
      products: mockProducts,
      appointments: mockAppointments,
      movements: mockMovements,
      salonConfig: mockSalonConfig,
    });

    // Load data from storage
    setTransactions(storage.get<Transaction>('transactions'));
    setAppointments(storage.get<Appointment>('appointments'));
    setProducts(storage.get<Product>('products'));
    setClients(storage.get<Client>('clients'));
    setIsLoading(false);
  }, []);

  const today = new Date();
  const yesterday = subDays(today, 1);
  const thisMonth = startOfMonth(today);

  // Calculate KPIs
  const todayAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.date), today) && apt.status === 'scheduled'
  ).length;

  const yesterdayAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.date), yesterday) && apt.status === 'scheduled'
  ).length;

  const appointmentsChange = yesterdayAppointments > 0 
    ? Math.round(((todayAppointments - yesterdayAppointments) / yesterdayAppointments) * 100)
    : 0;

  const todayRevenue = transactions
    .filter(t => t.type === 'income' && isSameDay(new Date(t.date), today) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const yesterdayRevenue = transactions
    .filter(t => t.type === 'income' && isSameDay(new Date(t.date), yesterday) && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const revenueChange = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : 0;

  // Clientes novos no mês
  const newClientsThisMonth = clients.filter(c => {
    const registrationDate = new Date(c.registrationDate);
    return registrationDate >= thisMonth;
  }).length;

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Top services this month
  const serviceRevenue: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'income' && new Date(t.date) >= thisMonth && t.status === 'completed')
    .forEach(t => {
      t.serviceIds?.forEach(serviceId => {
        serviceRevenue[serviceId] = (serviceRevenue[serviceId] || 0) + t.amount;
      });
    });

  const topServices = Object.entries(serviceRevenue)
    .map(([serviceId, revenue]) => {
      const service = mockServices.find(s => s.id === serviceId);
      return { service, revenue, count: transactions.filter(t => t.serviceIds?.includes(serviceId)).length };
    })
    .filter(item => item.service)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Dados para gráfico de área - Serviços prestados no mês por dia
  const monthDays = eachDayOfInterval({ start: thisMonth, end: endOfMonth(today) });
  const servicesByDay = monthDays.map(day => {
    const dayServices = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, day) && apt.status === 'completed';
    }).length;
    return {
      date: format(day, 'dd/MM'),
      services: dayServices,
    };
  });

  // Dados para gráfico de pizza - Desempenho dos profissionais
  const professionalPerformance = mockProfissionais.map(prof => {
    const profAppointments = appointments.filter(apt => 
      apt.professionalId === prof.id && 
      new Date(apt.date) >= thisMonth &&
      apt.status === 'completed'
    );
    return {
      name: prof.nome,
      value: profAppointments.length,
      color: prof.cor,
    };
  }).filter(item => item.value > 0);

  // Don't render until data is loaded to avoid hydration mismatch
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu salão</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu salão</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard 
          title="Agendamentos Hoje" 
          value={todayAppointments.toString()} 
          percentage={appointmentsChange}
          trend={appointmentsChange >= 0 ? "up" : "down"}
        />
        <KpiCard 
          title="Faturamento Hoje" 
          value={formatCurrency(todayRevenue)} 
          percentage={revenueChange}
          trend={revenueChange >= 0 ? "up" : "down"}
        />
        <KpiCard 
          title="Clientes Novos no Mês" 
          value={newClientsThisMonth.toString()} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Serviços Prestados no Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Prestados no Mês</CardTitle>
            <CardDescription>
              Quantidade de serviços realizados por dia
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                services: {
                  label: "Serviços",
                  color: "#3b82f6",
                },
              }}
              className="h-[350px] w-full"
            >
              <AreaChart data={servicesByDay} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="fillServices" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#60a5fa"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="services"
                  type="natural"
                  fill="url(#fillServices)"
                  fillOpacity={0.6}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Desempenho dos Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho dos Profissionais</CardTitle>
            <CardDescription>
              Serviços concluídos por profissional no mês
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={professionalPerformance.reduce((acc, item) => {
                acc[item.name] = {
                  label: item.name,
                  color: item.color,
                };
                return acc;
              }, {} as Record<string, { label: string; color: string }>)}
              className="h-[350px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={professionalPerformance}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {professionalPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Serviços do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeaderComponent>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                </TableRow>
              </TableHeaderComponent>
              <TableBody>
                {topServices.map((item) => (
                  <TableRow key={item.service!.id}>
                    <TableCell className="font-medium">{item.service!.name}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date)}</p>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

