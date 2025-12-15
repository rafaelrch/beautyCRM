"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { KanbanColumn as KanbanColumnType } from "@/data/mock-kanban";

interface ModalColumnProps {
  open: boolean;
  onClose: () => void;
  onSave: (column: Omit<KanbanColumnType, "id" | "order">) => void;
  column?: KanbanColumnType;
}

export function ModalColumn({
  open,
  onClose,
  onSave,
  column,
}: ModalColumnProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (column) {
      setTitle(column.title);
    } else {
      setTitle("");
    }
  }, [column, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      status: title.toLowerCase().replace(/\s+/g, "_"),
    });
    onClose();
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{column ? "Editar Coluna" : "Adicionar Coluna"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="mb-[3px]">Nome da Coluna *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Em análise"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{column ? "Atualizar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}






