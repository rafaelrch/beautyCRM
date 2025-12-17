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
          
          {/* Data e horário com ícones */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">{card.data ? format(card.data, "dd/MM") : ""}</span>
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">{card.horario}</span>
          </div>
          
          {/* Valor do serviço com ícone de cifrão */}
          {card.valor && card.valor > 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {formatCurrency(card.valor)}
              </span>
            </div>
          )}
          
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

