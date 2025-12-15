"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { 
  Calendar,
  Clock,
  Trash2,
  Eye,
  MoreVertical,
  DollarSign,
  GripVertical
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

const getStatusDotColor = (status: string): string => {
  const colors: Record<string, string> = {
    agendado: "bg-yellow-500",
    confirmado: "bg-blue-500",
    concluido: "bg-green-500",
    cancelado: "bg-red-500",
    nao_compareceu: "bg-orange-500",
    scheduled: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    "no-show": "bg-orange-500",
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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all ${
        isDragging ? "shadow-lg scale-105 opacity-50 rotate-2" : ""
      }`}
    >
      <div className="flex">
        {/* DRAG HANDLE - Área específica para arrastar */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 cursor-grab active:cursor-grabbing rounded-l-xl transition-colors"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* CONTEÚDO DO CARD - Área clicável */}
        <div 
          className="flex-1 p-4 cursor-pointer"
          onClick={() => onViewDetails(card)}
        >
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
            
            {/* Data e horário com ícones */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">{card.data ? format(card.data, "dd/MM") : ""}</span>
              <Clock className="h-3.5 w-3.5 ml-1" />
              <span className="text-xs">{card.horario}</span>
            </div>
            
            {/* Valor do serviço */}
            {card.valor && card.valor > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {formatCurrency(card.valor)}
                </span>
              </div>
            )}
            
            {/* Menu de opções */}
            <div 
              className="flex items-center ml-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(card)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
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
    </div>
  );
}
