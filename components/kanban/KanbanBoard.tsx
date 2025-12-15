"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import type {
  KanbanCard as KanbanCardType,
  KanbanColumn as KanbanColumnType,
} from "@/data/mock-kanban";

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  cards: KanbanCardType[];
  onColumnsChange: (columns: KanbanColumnType[]) => void;
  onCardsChange: (cards: KanbanCardType[]) => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCardType) => void;
  onDeleteCard: (cardId: string) => void;
  onViewCardDetails: (card: KanbanCardType) => void;
  onAddColumn: () => void;
}

export function KanbanBoard({
  columns,
  cards,
  onCardsChange,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onViewCardDetails,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduzido para 3px - mais responsivo
      },
    })
  );

  const activeCard = activeId ? cards.find((card) => card.id === activeId) : null;

  // Algoritmo de colisão customizado: prioriza colunas quando o ponteiro está dentro delas
  const customCollisionDetection: CollisionDetection = (args) => {
    // Primeiro, tenta detectar colisão com o ponteiro (mais preciso)
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      // Prioriza colunas sobre cards
      const columnCollision = pointerCollisions.find(
        (collision) => columns.some((col) => col.id === collision.id)
      );
      
      if (columnCollision) {
        return [columnCollision];
      }
      
      return pointerCollisions;
    }
    
    // Fallback para intersecção de retângulos
    return rectIntersection(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar o card sendo arrastado
    const activeCard = cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    // CASO 1: Soltou sobre uma COLUNA
    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      // Mover card para o final da coluna
      const updatedCards = cards.map((card) => {
        if (card.id === activeId) {
          return {
            ...card,
            columnId: targetColumn.id,
            status: targetColumn.status,
          };
        }
        return card;
      });
      onCardsChange(updatedCards);
      return;
    }

    // CASO 2: Soltou sobre outro CARD
    const overCard = cards.find((card) => card.id === overId);
    if (overCard && overCard.columnId !== activeCard.columnId) {
      // Mover card para a coluna do card sobre o qual foi solto
      const targetColumn = columns.find((col) => col.id === overCard.columnId);
      if (targetColumn) {
        const updatedCards = cards.map((card) => {
          if (card.id === activeId) {
            return {
              ...card,
              columnId: targetColumn.id,
              status: targetColumn.status,
            };
          }
          return card;
        });
        onCardsChange(updatedCards);
      }
    }
    
    // CASO 3: Reordenação dentro da mesma coluna
    // (Já é tratado pelo SortableContext automaticamente)
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Não fazer nada no dragOver - deixar o feedback visual do isOver funcionar
    // A lógica de mover acontece apenas no dragEnd
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 w-full px-1">
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column) => {
            const columnCards = cards
              .filter((card) => card.columnId === column.id)
              .sort((a, b) => {
                const [horaA, minutoA] = a.horario.split(':').map(Number);
                const [horaB, minutoB] = b.horario.split(':').map(Number);
                const minutosA = horaA * 60 + minutoA;
                const minutosB = horaB * 60 + minutoB;
                return minutosA - minutosB;
              });

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={columnCards}
                onAddCard={onAddCard}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
                onViewCardDetails={onViewCardDetails}
              />
            );
          })}
      </div>

      {/* Overlay do card sendo arrastado */}
      <DragOverlay>
        {activeCard ? (
          <div className="w-[320px] rotate-3 shadow-2xl">
            <KanbanCard
              card={activeCard}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onViewDetails={onViewCardDetails}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
