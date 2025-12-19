"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, CheckCircle } from "lucide-react";

interface CardAgendamentoProps {
  horario: string;
  nomeCliente: string;
  nomeServico: string;
  corProfissional: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu" | "pendente" | "scheduled" | "completed" | "cancelled" | "no-show";
  duracao: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const statusConfig = {
  agendado: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  confirmado: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  concluido: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  cancelado: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  nao_compareceu: { icon: XCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  // Compatibilidade com status antigos
  scheduled: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  pendente: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  "no-show": { icon: XCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

export function CardAgendamento({
  horario,
  nomeCliente,
  nomeServico,
  corProfissional,
  status,
  duracao,
  onClick,
  onDoubleClick,
}: CardAgendamentoProps) {
  const statusKey = status as keyof typeof statusConfig;
  const statusInfo = statusConfig[statusKey] || statusConfig.agendado;
  const Icon = statusInfo.icon;

  // Calcular altura baseada na duração (aproximadamente 4px por minuto, mínimo 40px)
  const altura = Math.max(40, (duracao / 15) * 10);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDoubleClick?.();
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "rounded-lg border-l-4 p-2 mb-1 cursor-pointer transition-all hover:scale-[1.02]",
        "text-xs",
        statusInfo.bg,
        statusInfo.border
      )}
      style={{
        borderLeftColor: corProfissional,
        backgroundColor: `${corProfissional}20`,
        minHeight: `${altura}px`,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-semibold text-foreground">{horario}</span>
            <Icon className={cn("h-3 w-3", statusInfo.color)} />
          </div>
          <p className="font-medium text-foreground truncate">{nomeCliente}</p>
          <p className="text-muted-foreground text-[10px] truncate">{nomeServico}</p>
        </div>
      </div>
    </div>
  );
}

export default CardAgendamento;
