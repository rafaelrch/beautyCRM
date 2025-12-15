"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "./KanbanCard";
import type { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType } from "@/data/mock-kanban";

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
    <div className="flex-1 min-w-[320px] max-w-[380px] h-full">
      <div className="h-full flex flex-col bg-gray-50 rounded-lg">
        {/* Header da Coluna */}
        <div className="flex items-center justify-between p-4 bg-white rounded-t-lg border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusIndicatorColor(column.status)}`} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              {column.title}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {cards.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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

        {/* ÁREA DROPPABLE - Ocupa TODA a área restante da coluna */}
        <div 
          ref={setNodeRef}
          className={`flex-1 p-3 overflow-y-auto transition-all min-h-[400px] ${
            isOver ? "bg-blue-50 ring-2 ring-blue-400 ring-inset rounded-b-lg" : ""
          }`}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {/* Container que ocupa 100% da altura */}
            <div className="h-full min-h-full flex flex-col">
              {/* Cards existentes */}
              <div className="space-y-3">
                {cards.map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    onEdit={onEditCard}
                    onDelete={onDeleteCard}
                    onViewDetails={onViewCardDetails}
                  />
                ))}
              </div>
              
              {/* Placeholder que SEMPRE ocupa o espaço restante quando vazio */}
              {cards.length === 0 && (
                <div className={`
                  flex-1 min-h-[350px] flex flex-col items-center justify-center 
                  text-sm text-gray-400 border-2 border-dashed rounded-lg 
                  transition-all
                  ${isOver 
                    ? "border-blue-400 bg-blue-100 text-blue-600" 
                    : "border-gray-300"
                  }
                `}>
                  <div className="text-center">
                    <p className="font-medium text-base">
                      {isOver ? "Solte aqui!" : "Nenhum agendamento"}
                    </p>
                    <p className="text-xs mt-1">
                      {isOver 
                        ? "Solte o card para adicionar nesta coluna" 
                        : "Arraste cards para esta coluna"
                      }
                    </p>
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
