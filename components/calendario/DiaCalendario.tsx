"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CardAgendamento } from "./CardAgendamento";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Agendamento {
  id: string;
  horario: string;
  nomeCliente: string;
  nomeServico: string;
  corProfissional: string;
  status: string;
  duracao: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

interface DiaCalendarioProps {
  dia: number;
  mes: number;
  ano: number;
  agendamentos: Agendamento[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick?: () => void;
  onAgendamentoClick?: (agendamento: Agendamento) => void;
  onAgendamentoDoubleClick?: (agendamento: Agendamento) => void;
}

export function DiaCalendario({
  dia,
  mes,
  ano,
  agendamentos,
  isCurrentMonth,
  isToday,
  onClick,
  onAgendamentoClick,
  onAgendamentoDoubleClick,
}: DiaCalendarioProps) {
  const agendamentosVisiveis = agendamentos.slice(0, 3);
  const agendamentosRestantes = agendamentos.slice(3);
  const quantidadeRestante = agendamentosRestantes.length;

  return (
    <div
      className={cn(
        "border border-border min-h-[120px] p-2 bg-white transition-colors",
        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isToday && "bg-blue-50 border-blue-300 border-2",
        onClick && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium",
            isToday && "text-blue-600 font-bold"
          )}
        >
          {dia}
        </span>
      </div>
      <div className="space-y-1">
        {agendamentosVisiveis.map((agendamento, index) => {
          const handleClick = () => {
            onAgendamentoClick?.(agendamento);
          };
          
          const handleDoubleClick = () => {
            onAgendamentoDoubleClick?.(agendamento);
          };

          return (
            <CardAgendamento
              key={agendamento.id || index}
              horario={agendamento.horario}
              nomeCliente={agendamento.nomeCliente}
              nomeServico={agendamento.nomeServico}
              corProfissional={agendamento.corProfissional}
              status={agendamento.status as any}
              duracao={agendamento.duracao}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            />
          );
        })}
        {quantidadeRestante > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <div
                className="text-xs text-muted-foreground text-center py-1 cursor-pointer hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                +{quantidadeRestante} mais
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-2" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  Mais agendamentos ({quantidadeRestante})
                </p>
                {agendamentosRestantes.map((agendamento, index) => {
                  const handleClick = () => {
                    onAgendamentoClick?.(agendamento);
                  };
                  
                  const handleDoubleClick = () => {
                    onAgendamentoDoubleClick?.(agendamento);
                  };

                  return (
                    <CardAgendamento
                      key={agendamento.id || `rest-${index}`}
                      horario={agendamento.horario}
                      nomeCliente={agendamento.nomeCliente}
                      nomeServico={agendamento.nomeServico}
                      corProfissional={agendamento.corProfissional}
                      status={agendamento.status as any}
                      duracao={agendamento.duracao}
                      onClick={handleClick}
                      onDoubleClick={handleDoubleClick}
                    />
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

