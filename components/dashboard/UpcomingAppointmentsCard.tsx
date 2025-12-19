"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

interface Appointment {
  id: string;
  clientId: string;
  serviceIds: string[];
  professionalId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  notes: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthdate: Date;
  address: string;
  cpf: string;
  registrationDate: Date;
  lastVisit: Date | null;
  totalSpent: number;
  totalVisits: number;
  notes: string;
  status: "active" | "inactive";
}

interface UpcomingAppointmentsCardProps {
  appointments: Appointment[];
  clients: Client[];
  periodDisplay?: string;
}

function getStatusBadge(status: string) {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case "scheduled":
    case "agendado":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Agendado</Badge>;
    case "completed":
    case "concluido":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Concluído</Badge>;
    case "cancelled":
    case "cancelado":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
    case "no-show":
    case "nao-compareceu":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Não compareceu</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(time: string): string {
  // Extrair apenas horas e minutos (hh:mm)
  // Aceita formatos como "09:00:00", "09:00:0", "09:00", etc.
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0');
    const minutes = timeMatch[2];
    return `${hours}:${minutes}`;
  }
  return time; // Retorna o original se não conseguir formatar
}

export function UpcomingAppointmentsCard({
  appointments,
  clients,
  periodDisplay,
}: UpcomingAppointmentsCardProps) {
  const getClientName = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Cliente não encontrado";
  };

  // Mostrar apenas os próximos 8 agendamentos
  const displayAppointments = appointments.slice(0, 8);

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Próximos Agendamentos
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {appointments.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {displayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento para o período
            </p>
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="space-y-3">
              {displayAppointments.map((appointment) => {
                const clientName = getClientName(appointment.clientId);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(clientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{clientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {format(appointment.date, "dd/MM", { locale: ptBR })}
                        </span>
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate">{formatTime(appointment.startTime)}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
