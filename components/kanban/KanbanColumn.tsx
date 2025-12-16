"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "./KanbanCard";
import type { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType } from "@/types/kanban";

interface KanbanColumnProps {
  column: KanbanColumnType;
  cards: KanbanCardType[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCardType) => void;
  onDeleteCard: (cardId: string) => void;
  onViewCardDetails: (card: KanbanCardType) => void;
}

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onViewCardDetails,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const cardIds = cards.map((card) => card.id);

  // Função para obter cor do indicador de status
  const getStatusIndicatorColor = (status: string): string => {
    const colors: Record<string, string> = {
      agendado: "bg-yellow-500",
      confirmado: "bg-blue-500",
      concluido: "bg-green-500",
      cancelado: "bg-red-500",
      nao_compareceu: "bg-orange-500",
    };
    return colors[status] || "bg-gray-400";
  };

  return (
    <div className="flex-1 min-w-0 flex-shrink-0">
      <div
        className={`h-full flex flex-col bg-gray-50 rounded-lg p-3 min-h-[200px] ${
          isOver ? "ring-2 ring-primary ring-offset-2 bg-blue-50" : ""
        }`}
      >
        {/* Header da Coluna */}
        <div className="flex items-center justify-between mb-4 pb-3 bg-white rounded-lg px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {/* Ícone circular com indicador de status */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusIndicatorColor(column.status)}`} />
              </div>
            </div>
            {/* Título da coluna */}
            <h3 className="text-sm font-semibold text-gray-900">
              {column.title}
            </h3>
          </div>
          {/* Botões de ação alinhados à direita */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Editar coluna</DropdownMenuItem>
                <DropdownMenuItem>Arquivar coluna</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => onAddCard(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cards - Área droppable */}
        <div 
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto pr-1 min-h-[150px] ${
            isOver && cards.length === 0 ? "bg-primary/5" : ""
          }`}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 min-h-[100px]">
              {cards.map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                  onViewDetails={onViewCardDetails}
                />
              ))}
              {/* Área vazia para drop quando não há cards */}
              {cards.length === 0 && (
                <div className={`h-32 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed rounded-lg transition-colors ${
                  isOver ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                }`}>
                  <div className="text-center">
                    <p className="font-medium">Solte cards aqui</p>
                    <p className="text-xs mt-1">Arraste um card para esta coluna</p>
                  </div>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

