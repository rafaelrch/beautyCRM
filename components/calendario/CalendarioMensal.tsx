"use client";

import { useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth } from "date-fns";
import { formatMonthYear } from "@/lib/dateHelpers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiaCalendario } from "./DiaCalendario";

export interface Agendamento {
  id: string;
  horario: string;
  nomeCliente: string;
  nomeServico: string;
  corProfissional: string;
  status: string;
  duracao: number;
  data: Date;
  onClick?: () => void;
}

export interface CalendarioMensalProps {
  agendamentos: Agendamento[];
  onDiaClick?: (data: Date) => void;
  onAgendamentoClick?: (agendamento: Agendamento) => void;
  onAgendamentoDoubleClick?: (agendamento: Agendamento) => void;
}

export function CalendarioMensal({
  agendamentos,
  onDiaClick,
  onAgendamentoClick,
  onAgendamentoDoubleClick,
}: CalendarioMensalProps) {
  const [dataAtual, setDataAtual] = useState(new Date());
  const hoje = new Date();

  const inicioMes = startOfMonth(dataAtual);
  const fimMes = endOfMonth(dataAtual);
  const inicioSemana = startOfWeek(inicioMes, { weekStartsOn: 0 }); // Domingo
  const fimSemana = endOfWeek(fimMes, { weekStartsOn: 0 });

  const dias = eachDayOfInterval({ start: inicioSemana, end: fimSemana });

  const agendamentosPorDia = dias.map((dia) => {
    const agendamentosDoDia = agendamentos.filter((apt) => isSameDay(apt.data, dia));
    // Ordenar por horário (mais cedo primeiro)
    return agendamentosDoDia.sort((a, b) => {
      const [horaA, minutoA] = a.horario.split(':').map(Number);
      const [horaB, minutoB] = b.horario.split(':').map(Number);
      const minutosA = horaA * 60 + minutoA;
      const minutosB = horaB * 60 + minutoB;
      return minutosA - minutosB;
    });
  });

  const irParaMesAnterior = () => {
    setDataAtual(subMonths(dataAtual, 1));
  };

  const irParaProximoMes = () => {
    setDataAtual(addMonths(dataAtual, 1));
  };

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-4">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={irParaMesAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {formatMonthYear(dataAtual)}
          </h2>
          <Button variant="outline" size="icon" onClick={irParaProximoMes}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="border border-border rounded-lg overflow-hidden bg-white">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-border">
          {diasSemana.map((dia) => (
            <div
              key={dia}
              className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted/50"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="grid grid-cols-7">
          {dias.map((dia, index) => (
            <DiaCalendario
              key={dia.toISOString()}
              dia={dia.getDate()}
              mes={dia.getMonth()}
              ano={dia.getFullYear()}
              agendamentos={agendamentosPorDia[index]}
              isCurrentMonth={isSameMonth(dia, dataAtual)}
              isToday={isSameDay(dia, hoje)}
              onClick={() => onDiaClick?.(dia)}
              onAgendamentoClick={onAgendamentoClick}
              onAgendamentoDoubleClick={onAgendamentoDoubleClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

