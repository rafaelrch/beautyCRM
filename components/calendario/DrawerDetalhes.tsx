"use client";

import { X, Edit, Trash2, CheckCircle2, Clock, XCircle, Phone, Mail, Calendar, Clock as ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { formatDate, formatPhone, formatDuration } from "@/lib/formatters";

interface AgendamentoDetalhes {
  id: string;
  horario: string;
  data: Date | string;
  cliente: {
    nome: string;
    telefone: string;
    email: string;
    avatar?: string;
  };
  servico: {
    nome: string;
    duracao: number;
  };
  profissional: {
    nome: string;
    cor: string;
    especialidade: string;
  };
  status: "pendente" | "cancelado" | "concluido" | "scheduled" | "completed" | "cancelled" | "no-show";
  observacao?: string;
}

interface DrawerDetalhesProps {
  open: boolean;
  onClose: () => void;
  agendamento: AgendamentoDetalhes | null;
  onEdit?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

const statusConfig = {
  scheduled: { 
    label: "Agendado", 
    icon: CheckCircle2, 
    color: "bg-green-100 text-green-700 border-green-200",
    iconColor: "text-green-600"
  },
  pendente: { 
    label: "Pendente", 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  cancelado: { 
    label: "Cancelado", 
    icon: XCircle, 
    color: "bg-red-100 text-red-700 border-red-200",
    iconColor: "text-red-600"
  },
  cancelled: { 
    label: "Cancelado", 
    icon: XCircle, 
    color: "bg-red-100 text-red-700 border-red-200",
    iconColor: "text-red-600"
  },
  concluido: { 
    label: "Concluído", 
    icon: CheckCircle2, 
    color: "bg-gray-100 text-gray-700 border-gray-200",
    iconColor: "text-gray-600"
  },
  completed: { 
    label: "Concluído", 
    icon: CheckCircle2, 
    color: "bg-gray-100 text-gray-700 border-gray-200",
    iconColor: "text-gray-600"
  },
  "no-show": { 
    label: "Falta", 
    icon: XCircle, 
    color: "bg-orange-100 text-orange-700 border-orange-200",
    iconColor: "text-orange-600"
  },
};

export function DrawerDetalhes({
  open,
  onClose,
  agendamento,
  onEdit,
  onCancel,
  onComplete,
}: DrawerDetalhesProps) {
  if (!agendamento) {
    return null;
  }

  const statusKey = agendamento.status as keyof typeof statusConfig;
  const statusInfo = statusConfig[statusKey] || statusConfig.pendente;
  const StatusIcon = statusInfo.icon;

  const handleCancel = () => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      onCancel?.();
    }
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent 
        className="h-full w-[500px] max-w-[500px] rounded-l-xl rounded-r-none border-r-0 data-[vaul-drawer-direction=right]:w-[500px] data-[vaul-drawer-direction=right]:max-w-[500px]"
        style={{ width: '500px', maxWidth: '500px', height: '100vh' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DrawerHeader className="border-b border-border pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DrawerDescription className="text-xs text-muted-foreground mb-1">
                  Agendamento
                </DrawerDescription>
                <DrawerTitle className="text-2xl font-bold text-foreground">
                  {agendamento.servico.nome}
                </DrawerTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(agendamento.data)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    <span>{agendamento.horario}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(agendamento.servico.duracao)}</span>
                  </div>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Seção Cliente */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                CLIENTE
              </label>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={agendamento.cliente.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getIniciais(agendamento.cliente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground mb-2">
                        {agendamento.cliente.nome}
                      </p>
                      {agendamento.cliente.telefone && (
                        <a
                          href={`tel:${agendamento.cliente.telefone.replace(/\D/g, '')}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
                        >
                          <Phone className="h-4 w-4" />
                          <span>{formatPhone(agendamento.cliente.telefone)}</span>
                        </a>
                      )}
                      {agendamento.cliente.email && (
                        <a
                          href={`mailto:${agendamento.cliente.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{agendamento.cliente.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seção Status */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                STATUS
              </label>
              <Badge 
                variant="outline" 
                className={cn("rounded-full px-3 py-1.5 flex items-center gap-2 w-fit", statusInfo.color)}
              >
                <StatusIcon className={cn("h-4 w-4", statusInfo.iconColor)} />
                {statusInfo.label}
              </Badge>
            </div>

            {/* Seção Serviço */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                SERVIÇO
              </label>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {agendamento.servico.nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duração: {formatDuration(agendamento.servico.duracao)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seção Observação */}
            {agendamento.observacao ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  OBSERVAÇÃO DO AGENDAMENTO
                </label>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {agendamento.observacao}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  OBSERVAÇÃO DO AGENDAMENTO
                </label>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma observação registrada
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Seção Profissional */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                PROFISSIONAL RESPONSÁVEL
              </label>
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-purple-300">
                      <AvatarFallback 
                        className="text-white"
                        style={{ backgroundColor: agendamento.profissional.cor }}
                      >
                        {getIniciais(agendamento.profissional.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {agendamento.profissional.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {agendamento.profissional.especialidade}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer - Ações */}
          <DrawerFooter className="border-t border-border pt-4">
            <div className="space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Agendamento
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={handleCancel}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancelar Agendamento
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
