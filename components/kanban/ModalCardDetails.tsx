"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getColumnColor } from "@/data/mock-kanban";
import type { KanbanCard as KanbanCardType } from "@/data/mock-kanban";

interface ModalCardDetailsProps {
  open: boolean;
  onClose: () => void;
  card: KanbanCardType | null;
}

export function ModalCardDetails({
  open,
  onClose,
  card,
}: ModalCardDetailsProps) {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Cliente
            </p>
            <p className="text-base font-semibold">{card.clienteNome}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Serviço
            </p>
            <p className="text-base">{card.servico}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Horário
            </p>
            <p className="text-base">🕐 {card.horario}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Profissional
            </p>
            <p className="text-base">{card.profissional}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Status
            </p>
            <Badge
              variant="outline"
              className={`${getColumnColor(card.status)}`}
            >
              {card.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}






