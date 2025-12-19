"use client";

import React, { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { 
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { KanbanCard as KanbanCardType } from "@/types/kanban";

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit: (card: KanbanCardType) => void;
  onDelete: (cardId: string) => void;
  onViewDetails: (card: KanbanCardType) => void;
}

// Função para obter cor do status dot
const getStatusDotColor = (status: string): string => {
  const colors: Record<string, string> = {
    agendado: "bg-yellow-500",
    confirmado: "bg-blue-500",
    concluido: "bg-green-500",
    cancelado: "bg-red-500",
    nao_compareceu: "bg-orange-500",
    // Compatibilidade com status antigos
    scheduled: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    "no-show": "bg-orange-500",
  };
  return colors[status] || "bg-gray-400";
};

export const KanbanCard = ({ card, onEdit, onDelete, onViewDetails }: KanbanCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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

  // Formatar valor monetário
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Converter cor hex para rgba com opacidade
  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
      className={`bg-white rounded-xl p-4 border border-gray-200 cursor-grab active:cursor-grabbing transition-all overflow-hidden ${
        isDragging ? "scale-105 opacity-50" : ""
      }`}
    >
      {/* Conteúdo do Card */}
      <div className="flex flex-col min-h-0 h-full">
        {/* Título (nome) com data ao lado */}
        <div className="flex items-center gap-2 mb-1.5">
          <h4 className="font-semibold text-sm text-gray-900 leading-tight truncate flex-1">
            {card.clienteNome}
          </h4>
          {card.data && (
            <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">{format(card.data, "dd/MM")}</span>
            </div>
          )}
        </div>
        
        {/* Subtítulo (serviço) */}
        <p className="text-xs text-gray-600 mb-2 leading-relaxed truncate">
          {card.servico}
        </p>
        
        {/* Profissional em badge */}
        {card.profissional && (
          <div 
            className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold tracking-tighter mb-3 w-fit"
            style={{
              backgroundColor: card.profissionalCor ? hexToRgba(card.profissionalCor, 0.08) : hexToRgba('#6366f1', 0.08), // 8% opacity
              color: card.profissionalCor || '#6366f1', // 100% da cor
            }}
          >
            {card.profissional}
          </div>
        )}
        
        {/* Rodapé com flex layout */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
          {/* Ícone do status */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotColor(card.status)}`} />
          
          {/* Horário com ícone */}
          <div className="flex items-center gap-1 text-gray-500 min-w-0 flex-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs truncate">{card.horario}</span>
          </div>
          
          {/* Valor do serviço com ícone de cifrão */}
          {card.valor && card.valor > 0 && (
            <div className="flex items-center gap-0.5 text-gray-600 flex-shrink-0">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs font-medium whitespace-nowrap">
                {formatCurrency(card.valor)}
              </span>
            </div>
          )}
          
          {/* Menu de opções alinhado à direita */}
          <div className="flex items-center ml-auto flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-4 w-4 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(card)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
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

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg">Excluir Agendamento</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground">
              Tem certeza que deseja <span className="font-semibold text-red-600">excluir permanentemente</span> o agendamento de{" "}
              <span className="font-semibold">{card.clienteNome}</span> para o serviço{" "}
              <span className="font-semibold">{card.servico}</span>?
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(card.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sim, excluir agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

