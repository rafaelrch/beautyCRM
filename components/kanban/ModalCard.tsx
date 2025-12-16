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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { KanbanCard as KanbanCardType } from "@/types/kanban";

interface ModalCardProps {
  open: boolean;
  onClose: () => void;
  onSave: (card: Omit<KanbanCardType, "id" | "order">) => void;
  card?: KanbanCardType;
  columnId: string;
  profissionais: string[];
  servicos: string[];
}

export function ModalCard({
  open,
  onClose,
  onSave,
  card,
  columnId,
  profissionais,
  servicos,
}: ModalCardProps) {
  const [formData, setFormData] = useState({
    clienteNome: "",
    servico: "",
    horario: "",
    profissional: "",
    status: "",
  });

  useEffect(() => {
    if (card) {
      setFormData({
        clienteNome: card.clienteNome,
        servico: card.servico,
        horario: card.horario,
        profissional: card.profissional,
        status: card.status,
      });
    } else {
      setFormData({
        clienteNome: "",
        servico: "",
        horario: "",
        profissional: "",
        status: "",
      });
    }
  }, [card, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      columnId,
      status: formData.status || "scheduled",
    });
    onClose();
  };

  const gerarHorarios = () => {
    const horarios = [];
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        horarios.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      }
    }
    return horarios;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? "Editar Card" : "Adicionar Card"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clienteNome" className="mb-[3px]">Nome do Cliente *</Label>
            <Input
              id="clienteNome"
              value={formData.clienteNome}
              onChange={(e) =>
                setFormData({ ...formData, clienteNome: e.target.value })
              }
              required
              placeholder="Nome do cliente"
            />
          </div>
          <div>
            <Label htmlFor="servico" className="mb-[3px]">Serviço *</Label>
            <Select
              value={formData.servico}
              onValueChange={(value) =>
                setFormData({ ...formData, servico: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((servico) => (
                  <SelectItem key={servico} value={servico}>
                    {servico}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="horario" className="mb-[3px]">Horário *</Label>
            <Select
              value={formData.horario}
              onValueChange={(value) =>
                setFormData({ ...formData, horario: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {gerarHorarios().map((horario) => (
                  <SelectItem key={horario} value={horario}>
                    {horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="profissional" className="mb-[3px]">Profissional *</Label>
            <Select
              value={formData.profissional}
              onValueChange={(value) =>
                setFormData({ ...formData, profissional: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {profissionais.map((prof) => (
                  <SelectItem key={prof} value={prof}>
                    {prof}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{card ? "Atualizar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}






