"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
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
  onColumnsChange,
  onCardsChange,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onViewCardDetails,
  onAddColumn,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer movimento de 8px para ativar o drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  const activeCard = activeId
    ? cards.find((card) => card.id === activeId)
    : null;

  // Auto-scroll horizontal removido - não é mais necessário pois o Kanban ocupa toda a largura

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar o card ativo
    const activeCard = cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    // Verificar se soltou sobre uma coluna (prioridade sobre cards)
    // Verificar tanto pelo ID quanto pelo data.type
    const overColumn = columns.find((col) => col.id === overId);
    const overData = over.data.current;
    
    // Se overData tem type "column", usar o ID da coluna de lá
    let targetColumnId = overId;
    if (overData?.type === "column" && overData?.column?.id) {
      targetColumnId = overData.column.id;
    }
    
    const targetColumn = overColumn || columns.find((col) => col.id === targetColumnId);

    if (targetColumn) {
      // Mover card para a coluna
      const targetColumnCards = cards.filter((c) => c.columnId === targetColumn.id && c.id !== activeId);
      const updatedCards = cards.map((card) =>
        card.id === activeId
          ? {
              ...card,
              columnId: targetColumn.id,
              status: targetColumn.status,
              order: targetColumnCards.length,
            }
          : card
      );
      onCardsChange(updatedCards);
      return;
    }

    // Se soltou sobre outro card
    const overCard = cards.find((card) => card.id === overId);
    if (overCard) {
      if (activeCard.columnId === overCard.columnId) {
        // Reordenar dentro da mesma coluna
        const columnCards = cards
          .filter((card) => card.columnId === activeCard.columnId)
          .sort((a, b) => a.order - b.order);

        const oldIndex = columnCards.findIndex((card) => card.id === activeId);
        const newIndex = columnCards.findIndex((card) => card.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(columnCards, oldIndex, newIndex);
          const updatedCards = cards.map((card) => {
            if (card.columnId === activeCard.columnId) {
              const newOrder = reordered.findIndex((c) => c.id === card.id);
              return { ...card, order: newOrder };
            }
            return card;
          });
          onCardsChange(updatedCards);
        }
      } else {
        // Mover para outra coluna (soltou sobre um card de outra coluna)
        const targetColumn = columns.find((col) => col.id === overCard.columnId);
        if (targetColumn) {
          const targetColumnCards = cards.filter((c) => c.columnId === targetColumn.id);
          const updatedCards = cards.map((card) =>
            card.id === activeId
              ? {
                  ...card,
                  columnId: targetColumn.id,
                  status: targetColumn.status,
                  order: targetColumnCards.length,
                }
              : card
          );
          onCardsChange(updatedCards);
        }
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = cards.find((card) => card.id === activeId);
    if (!activeCard) return;

    // Verificar se está sobre uma coluna (incluindo colunas vazias)
    const overColumn = columns.find((col) => col.id === overId);
    const overData = over.data.current;
    
    // Se overData tem type "column", usar o ID da coluna de lá
    let targetColumnId = overId;
    if (overData?.type === "column" && overData?.column?.id) {
      targetColumnId = overData.column.id;
    }
    
    const targetColumn = overColumn || columns.find((col) => col.id === targetColumnId);
    
    if (targetColumn) {
      // Está sobre uma coluna (pode estar vazia) - permitir drop
      return;
    }

    // Verificar se está sobre um card
    const overCard = cards.find((card) => card.id === overId);
    if (overCard) {
      // Está sobre um card - permitir drop
      return;
    }
  };

  const columnIds = columns.map((col) => col.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-y-hidden pb-4 w-full"
        style={{ 
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns
            .sort((a, b) => a.order - b.order)
            .map((column) => {
              const columnCards = cards
                .filter((card) => card.columnId === column.id)
                .sort((a, b) => {
                  // Ordenar por horário (mais cedo primeiro), igual ao calendário
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
        </SortableContext>
      </div>
      <DragOverlay>
        {activeCard ? (
          <div className="w-80">
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

