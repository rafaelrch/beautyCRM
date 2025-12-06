"use client";

import React, { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Calendar,
  Edit,
  Trash2,
  Eye,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KanbanCard as KanbanCardType } from "@/data/mock-kanban";

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string) => void;
  onViewDetails: (card: KanbanCardType) => void;
}

// Função para obter cor do status dot
const getStatusDotColor = (status: string): string => {
  const colors: Record<string, string> = {
    scheduled: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return colors[status] || "bg-gray-400";
};

export function KanbanCard({ card, onEdit, onDelete, onViewDetails }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Obter data formatada (usando a data do agendamento se disponível)
  const formatDate = (horario: string): string => {
    // Por enquanto, retornamos apenas o horário
    // Em produção, você pode usar a data real do agendamento
    return horario;
  };

  // Estado para rastrear se houve movimento durante o clique (para diferenciar clique de drag)
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Registrar posição inicial do mouse
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Não abrir drawer se clicar no menu ou se estiver arrastando
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]') || isDragging) {
      return;
    }

    // Verificar se houve movimento significativo (drag) ou se foi um clique rápido
    if (dragStartRef.current) {
      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
      const deltaTime = Date.now() - dragStartRef.current.time;
      
      // Se moveu mais de 5px ou demorou mais de 200ms, provavelmente foi um drag
      if (deltaX > 5 || deltaY > 5 || deltaTime > 200) {
        dragStartRef.current = null;
        return;
      }
    }

    // Foi um clique simples, abrir drawer
    onViewDetails(card);
    dragStartRef.current = null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onClick={handleCardClick}
      className={`bg-white rounded-xl p-4 border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging ? "shadow-lg scale-105 opacity-50" : ""
      }`}
    >
      {/* Conteúdo do Card */}
      <div className="flex flex-col">
        {/* Título (nome) */}
        <h4 className="font-semibold text-sm text-gray-900 mb-1.5 leading-tight">
          {card.clienteNome}
        </h4>
        
        {/* Subtítulo (serviço) */}
        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
          {card.servico}
        </p>
        
        {/* Profissional */}
        <p className="text-xs text-gray-500 mb-4">
          {card.profissional}
        </p>
        
        {/* Rodapé com flex layout */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          {/* Ícone do status */}
          <div className={`w-2 h-2 rounded-full ${getStatusDotColor(card.status)}`} />
          
          {/* Data com ícone de calendário */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">{formatDate(card.horario)}</span>
          </div>
          
          {/* Menu de opções alinhado à direita */}
          <div className="flex items-center ml-auto" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(card)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(card)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(card.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

