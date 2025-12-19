"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, Calendar, X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FinancialChartCard } from "@/components/dashboard/FinancialChartCard";
import { NewClientsCard } from "@/components/dashboard/NewClientsCard";
import { EmployeePerformanceCard } from "@/components/dashboard/EmployeePerformanceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTransactions, getAppointments, getClients, getProfessionals } from "@/lib/supabase-helpers";
import { getPeriodDates, type PeriodFilter } from "@/lib/date-filters";
import { formatCurrency, formatPhone } from "@/lib/formatters";
import { startOfDay, endOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/types/database";

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

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProfessionalRow = Database["public"]["Tables"]["professionals"]["Row"];

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>("hoje");
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, appointmentsData, clientsData, professionalsData] = await Promise.all([
        getTransactions().catch(() => []),
        getAppointments().catch(() => []),
        getClients().catch(() => []),
        getProfessionals().catch(() => []),
      ]);

      setTransactions(transactionsData);
      setAppointments(appointmentsData);
      setClients(clientsData);
      setProfessionals(professionalsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { start, end } = useMemo(() => getPeriodDates(period), [period]);

  const periodDisplay = useMemo(() => {
    if (period === "hoje") {
      return format(start, "dd/MM/yyyy", { locale: ptBR });
    }
    const startFormatted = format(start, "dd/MM", { locale: ptBR });
    const endFormatted = format(end, "dd/MM", { locale: ptBR });
    const year = format(start, "yyyy", { locale: ptBR });
    return `${startFormatted} - ${endFormatted} de ${year}`;
  }, [period, start, end]);

  const filteredTransactions = useMemo(() => {
    const periodStart = startOfDay(start);
    const periodEnd = endOfDay(end);
    return transactions.filter((t) => {
      const transactionDate = startOfDay(parseLocalDate(t.date));
      return transactionDate >= periodStart && transactionDate <= periodEnd;
    });
  }, [transactions, start, end]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const appointmentDate = startOfDay(parseLocalDate(a.date));
      const periodStart = startOfDay(start);
      const periodEnd = startOfDay(end);
      return appointmentDate >= periodStart && appointmentDate <= periodEnd;
    });
  }, [appointments, start, end]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const registrationDate = startOfDay(parseLocalDate(c.created_at));
      const periodStart = startOfDay(start);
      const periodEnd = startOfDay(end);
      return registrationDate >= periodStart && registrationDate <= periodEnd;
    });
  }, [clients, start, end]);

  const faturamento = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const totalAgendamentos = useMemo(() => filteredAppointments.length, [filteredAppointments]);

  const totalCancelamentos = useMemo(() => {
    return filteredAppointments.filter((a) => {
      const status = String(a.status || "").toLowerCase();
      return status === "cancelado" || status === "cancelled";
    }).length;
  }, [filteredAppointments]);

  const proximosAgendamentos = useMemo(() => {
    return filteredAppointments
      .slice()
      .sort((a, b) => {
        const dateA = parseLocalDate(a.date);
        const dateB = parseLocalDate(b.date);
        const dateTimeA = new Date(
          dateA.getFullYear(),
          dateA.getMonth(),
          dateA.getDate(),
          ...(a.start_time ? a.start_time.split(":").map(Number) : [0, 0])
        );
        const dateTimeB = new Date(
          dateB.getFullYear(),
          dateB.getMonth(),
          dateB.getDate(),
          ...(b.start_time ? b.start_time.split(":").map(Number) : [0, 0])
        );
        return dateTimeA.getTime() - dateTimeB.getTime();
      })
      .map((a) => ({
        id: a.id,
        clientId: a.client_id,
        serviceIds: a.service_ids || [],
        professionalId: a.professional_id,
        date: parseLocalDate(a.date),
        startTime: a.start_time || "",
        endTime: a.end_time || "",
        status: a.status as string,
        totalAmount: Number(a.total_amount || 0),
        notes: a.notes || "",
      }));
  }, [filteredAppointments]);

  const desempenhoProfissionais = useMemo(() => {
    const performance: Record<string, { count: number; professional: ProfessionalRow }> = {};
    filteredAppointments.forEach((appointment) => {
      const status = String(appointment.status || "").toLowerCase();
      const isConcluded = status === "concluido" || status === "completed";
      if (isConcluded && appointment.professional_id) {
        const prof = professionals.find((p) => p.id === appointment.professional_id);
        if (!prof) return;
        if (!performance[appointment.professional_id]) {
          performance[appointment.professional_id] = { count: 0, professional: prof };
        }
        performance[appointment.professional_id].count += 1;
      }
    });
    return Object.values(performance).map((item) => ({
      name: item.professional.name,
      value: item.count,
      color: item.professional.color || "#3b82f6",
    }));
  }, [filteredAppointments, professionals]);

  const appointmentsForCard = useMemo(() => {
    return proximosAgendamentos.map((apt) => ({
      id: apt.id,
      clientId: apt.clientId,
      serviceIds: apt.serviceIds,
      professionalId: apt.professionalId,
      date: apt.date,
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status as string,
      totalAmount: apt.totalAmount,
      notes: apt.notes,
    }));
  }, [proximosAgendamentos]);

  const clientsForCard = useMemo(() => {
    return clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      birthdate: c.birthdate ? new Date(c.birthdate) : new Date(),
      address: c.address || "",
      cpf: c.cpf || "",
      registrationDate: new Date(c.created_at),
      lastVisit: c.last_visit ? new Date(c.last_visit) : null,
      totalSpent: Number(c.total_spent || 0),
      totalVisits: Number(c.total_visits || 0),
      notes: c.notes || "",
      status: (c.status || "active") as "active" | "inactive",
    }));
  }, [clients]);

  // Filtrar próximos agendamentos (a partir da hora atual)
  const proximosAgendamentosFuturos = useMemo(() => {
    const now = new Date();
    const currentDate = startOfDay(now);
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutos desde meia-noite

    return appointments
      .map((a) => {
        const appointmentDate = parseLocalDate(a.date);
        const appointmentDay = startOfDay(appointmentDate);
        const [hours = 0, minutes = 0] = (a.start_time || "00:00").split(":").map(Number);
        const appointmentTime = hours * 60 + minutes;

        return {
          id: a.id,
          clientId: a.client_id,
          date: appointmentDate,
          startTime: a.start_time || "",
          status: a.status as string,
        };
      })
      .filter((apt) => {
        const aptDate = startOfDay(apt.date);
        const [hours = 0, minutes = 0] = apt.startTime.split(":").map(Number);
        const aptTime = hours * 60 + minutes;

        // Se for hoje, verificar se o horário já passou
        if (aptDate.getTime() === currentDate.getTime()) {
          return aptTime >= currentTime;
        }
        // Se for data futura, incluir
        return aptDate > currentDate;
      })
      .sort((a, b) => {
        const dateA = a.date.getTime();
        const dateB = b.date.getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        const [hoursA = 0, minutesA = 0] = a.startTime.split(":").map(Number);
        const [hoursB = 0, minutesB = 0] = b.startTime.split(":").map(Number);
        return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
      })
      .slice(0, 10); // Limitar a 10 agendamentos
  }, [appointments]);

  const getClientName = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

  const getClientPhone = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId);
    return client?.phone || "";
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeDisplay = (time: string): string => {
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2];
      return `${hours}:${minutes}h`;
    }
    return time;
  };

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed" || statusLower === "concluido") {
      return {
        label: "Confirmado",
        icon: CheckCircle2,
        className: "text-blue-600 bg-blue-50 border-blue-200",
      };
    }
    if (statusLower === "scheduled" || statusLower === "agendado") {
      return {
        label: "Pendente",
        icon: AlertCircle,
        className: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    }
    return {
      label: status,
      icon: AlertCircle,
      className: "text-gray-600 bg-gray-50 border-gray-200",
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="text-sm text-muted-foreground">{periodDisplay}</span>
          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
            <SelectTrigger className="w-full lg:w-[140px] bg-white">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="ultimos-7-dias">Últimos 7 dias</SelectItem>
              <SelectItem value="este-mes">Este Mês</SelectItem>
              <SelectItem value="mes-passado">Mês passado</SelectItem>
              <SelectItem value="este-ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Row 1 - 3 Metric Cards + Upcoming Appointments (starts here, spans 2 rows) */}
          <div className="lg:col-span-3 sm:col-span-2">
            <MetricCard
              title="Faturamento"
              value={formatCurrency(faturamento)}
              icon={<DollarSign className="w-5 h-5" />}
              periodDisplay={periodDisplay}
            />
          </div>
          <div className="lg:col-span-3 sm:col-span-2">
            <MetricCard
              title="Agendamentos"
              value={totalAgendamentos.toString()}
              icon={<Calendar className="w-5 h-5" />}
              periodDisplay={periodDisplay}
            />
          </div>
          <div className="lg:col-span-3 sm:col-span-2">
            <MetricCard
              title="Cancelamentos"
              value={totalCancelamentos.toString()}
              icon={<X className="w-5 h-5" />}
              periodDisplay={periodDisplay}
            />
          </div>
          <div className="lg:col-span-3 lg:row-span-2 sm:col-span-2 self-stretch min-h-0 flex flex-col">
            <Card className="h-full flex flex-col min-h-0">
              <CardHeader className="pb-2 px-4 pt-4 flex-shrink-0">
                <CardTitle className="text-2xl font-semibold tracking-tighter">
                  Próximos Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden flex flex-col p-0">
                {proximosAgendamentosFuturos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6 px-4">
                    <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Nenhum agendamento futuro
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 min-h-0 px-4 pb-4">
                    <div className="space-y-2">
                      {proximosAgendamentosFuturos.map((appointment) => {
                        const clientName = getClientName(appointment.clientId);
                        const clientPhone = getClientPhone(appointment.clientId);
                        const statusInfo = getStatusInfo(appointment.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <div
                            key={appointment.id}
                            className="p-2 rounded-lg bg-[#f6f9fa] hover:bg-[#f3f3f3] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {getInitials(clientName)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {clientName}
                                </p>
                                {clientPhone && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {formatPhone(clientPhone)}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-2.5 w-2.5" />
                                    <span>{formatTimeDisplay(appointment.startTime)}</span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`${statusInfo.className} text-xs px-1.5 py-0.5 flex items-center gap-1`}
                                  >
                                    <StatusIcon className="h-2.5 w-2.5" />
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 2 - Financial Chart */}
          <div className="lg:col-span-9 sm:col-span-2">
            <FinancialChartCard 
              transactions={filteredTransactions} 
              period={period}
              periodDisplay={periodDisplay}
            />
          </div>

          {/* Row 3 - New Clients and Employee Performance */}
          <div className="lg:col-span-9 sm:col-span-2">
            <NewClientsCard 
              clients={filteredClients.map(c => ({
                id: c.id,
                name: c.name,
                phone: c.phone || "",
                email: c.email || "",
                birthdate: c.birthdate ? new Date(c.birthdate) : new Date(),
                address: c.address || "",
                cpf: c.cpf || "",
                registrationDate: new Date(c.created_at),
                lastVisit: c.last_visit ? new Date(c.last_visit) : null,
                totalSpent: Number(c.total_spent || 0),
                totalVisits: Number(c.total_visits || 0),
                notes: c.notes || "",
                status: (c.status || "active") as "active" | "inactive",
              }))}
              periodDisplay={periodDisplay}
            />
          </div>
          <div className="lg:col-span-3 sm:col-span-2">
            <EmployeePerformanceCard 
              data={desempenhoProfissionais}
              periodDisplay={periodDisplay}
            />
          </div>
        </div>
      )}
    </div>
  );
}
