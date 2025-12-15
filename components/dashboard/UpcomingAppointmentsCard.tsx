import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Sun, X, HelpCircle } from "lucide-react";
import { UserIcon, TagIcon } from "@heroicons/react/24/outline";
import type { Client } from "@/types";

interface AppointmentForCard {
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

interface UpcomingAppointmentsCardProps {
  appointments?: AppointmentForCard[];
  clients?: Client[];
  periodDisplay?: string;
}

// Formata horário no padrão hh:mm, mesmo que venha como hh:mm:ss
const formatTimeHHMM = (time: string) => {
  if (!time) return "--:--";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return time;
};

export function UpcomingAppointmentsCard({ appointments = [], clients = [], periodDisplay }: UpcomingAppointmentsCardProps) {
  const appointmentsWithClientInfo = appointments.map((appointment) => {
    const client = clients.find((c) => c.id === appointment.clientId);
    const time = formatTimeHHMM(appointment.startTime || "");
    
    // Determinar o status para exibição
    const status = String(appointment.status || "").toLowerCase();
    let statusLabel = "Pendente";
    let badgeStyle = "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0";
    let icon = <Sun className="w-3 h-3 mr-1" />;

    if (status === "concluido" || status === "completed" || status === "confirmado") {
      statusLabel = "Concluído";
      badgeStyle = "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0";
      icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
    } else if (status === "cancelado" || status === "cancelled") {
      statusLabel = "Cancelado";
      badgeStyle = "bg-red-100 text-red-700 hover:bg-red-100 border-0";
      icon = <X className="w-3 h-3 mr-1" />;
    } else if (status === "agendado" || status === "scheduled") {
      statusLabel = "Agendado";
      badgeStyle = "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0";
      icon = <TagIcon className="w-3 h-3 mr-1" />;
    } else if (status === "nao_compareceu" || status === "no-show") {
      statusLabel = "Não compareceu";
      badgeStyle = "bg-orange-100 text-orange-700 hover:bg-orange-100 border-0";
      icon = <HelpCircle className="w-3 h-3 mr-1" />;
    }
    
    return {
      id: appointment.id,
      clientName: client?.name || "Cliente não encontrado",
      phone: client?.phone || "",
      time: time,
      status,
      statusLabel,
      badgeStyle,
      icon,
    };
  });
  return (
    <Card className="bg-white rounded-xl shadow-sm h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Próximos agendamentos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col max-h-[620px]">
        <div
          className="space-y-3 flex-1 overflow-y-auto pr-1
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            [&::-webkit-scrollbar-track]:bg-transparent
            [scrollbar-width:thin]
            [scrollbar-color:#d1d5db_transparent]"
        >
          {appointmentsWithClientInfo.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento próximo</p>
          ) : (
            appointmentsWithClientInfo.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f1f0fb] flex items-center justify-center text-[#3211ff]">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{appointment.clientName}</p>
                <p className="text-xs text-muted-foreground">{appointment.phone}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={appointment.badgeStyle}
                >
                  <>
                    {appointment.icon}
                    {appointment.statusLabel}
                  </>
                </Badge>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

