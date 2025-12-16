"use client";

import { useState, useEffect } from "react";
import { X, Edit, Trash2, CheckCircle2, Clock, XCircle, Phone, Mail, Calendar, Clock as ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface AgendamentoDetalhes {
  id: string;
  horario: string;
  data: Date | string;
  cliente: {
    id: string;
    nome: string;
    telefone: string;
    email: string;
    avatar?: string;
  };
  servico: {
    id: string;
    nome: string;
    duracao: number;
  };
  profissional: {
    id: string;
    nome: string;
    cor: string;
    especialidade: string;
  };
  status: "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu" | string;
  observacao?: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

interface Servico {
  id: string;
  nome: string;
  duracao: number;
  preco: number;
}

interface Profissional {
  id: string;
  nome: string;
  cor: string;
  especialidade: string;
}

interface DrawerDetalhesProps {
  open: boolean;
  onClose: () => void;
  agendamento: AgendamentoDetalhes | null;
  clientes?: Cliente[];
  servicos?: Servico[];
  profissionais?: Profissional[];
  onSave?: (dados: { 
    status: string; 
    observacao?: string;
    data?: string;
    horario?: string;
    servicoId?: string;
    profissionalId?: string;
  }) => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

const statusConfig = {
  agendado: { 
    label: "Pendente", 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  confirmado: { 
    label: "Confirmado", 
    icon: CheckCircle2, 
    color: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-600"
  },
  concluido: { 
    label: "Concluido", 
    icon: CheckCircle2, 
    color: "bg-green-100 text-green-700 border-green-200",
    iconColor: "text-green-600"
  },
  cancelado: { 
    label: "Cancelado", 
    icon: XCircle, 
    color: "bg-red-100 text-red-700 border-red-200",
    iconColor: "text-red-600"
  },
  nao_compareceu: { 
    label: "Não compareceu", 
    icon: XCircle, 
    color: "bg-orange-100 text-orange-700 border-orange-200",
    iconColor: "text-orange-600"
  },
  // Compatibilidade com status antigos (caso ainda existam)
  scheduled: { 
    label: "Pendente", 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  pendente: { 
    label: "Pendente", 
    icon: Clock, 
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  cancelled: { 
    label: "Cancelado", 
    icon: XCircle, 
    color: "bg-red-100 text-red-700 border-red-200",
    iconColor: "text-red-600"
  },
  completed: { 
    label: "Concluido", 
    icon: CheckCircle2, 
    color: "bg-green-100 text-green-700 border-green-200",
    iconColor: "text-green-600"
  },
  "no-show": { 
    label: "Não compareceu", 
    icon: XCircle, 
    color: "bg-orange-100 text-orange-700 border-orange-200",
    iconColor: "text-orange-600"
  },
};

export function DrawerDetalhes({
  open,
  onClose,
  agendamento,
  clientes = [],
  servicos = [],
  profissionais = [],
  onSave,
  onCancel,
  onComplete,
}: DrawerDetalhesProps) {
  const [statusEditado, setStatusEditado] = useState<string>("");
  const [observacaoEditada, setObservacaoEditada] = useState<string>("");
  const [dataEditada, setDataEditada] = useState<string>("");
  const [horarioEditado, setHorarioEditado] = useState<string>("");
  const [servicoEditado, setServicoEditado] = useState<string>("");
  const [profissionalEditado, setProfissionalEditado] = useState<string>("");

  useEffect(() => {
    if (agendamento) {
      setStatusEditado(agendamento.status);
      setObservacaoEditada(agendamento.observacao || "");
      
      // Converter data para formato string evitando problemas de timezone
      let dataStr: string;
      if (agendamento.data instanceof Date) {
        // Extrair ano, mês e dia diretamente do objeto Date (timezone local)
        const year = agendamento.data.getFullYear();
        const month = String(agendamento.data.getMonth() + 1).padStart(2, '0');
        const day = String(agendamento.data.getDate()).padStart(2, '0');
        dataStr = `${year}-${month}-${day}`;
      } else if (typeof agendamento.data === 'string') {
        // Se já for string, pegar apenas a parte da data (YYYY-MM-DD)
        dataStr = agendamento.data.split('T')[0];
      } else {
        // Converter para Date e depois extrair componentes
        const dateObj = new Date(agendamento.data);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dataStr = `${year}-${month}-${day}`;
      }
      setDataEditada(dataStr);
      
      setHorarioEditado(agendamento.horario);
      setServicoEditado(agendamento.servico.id);
      setProfissionalEditado(agendamento.profissional.id);
    }
  }, [agendamento]);

  if (!agendamento) {
    return null;
  }

  const statusKey = statusEditado as keyof typeof statusConfig;
  const statusInfo = statusConfig[statusKey] || statusConfig.agendado;
  const StatusIcon = statusInfo.icon;

  // Converter data original para comparar (mesma lógica do useEffect)
  const converterDataParaString = (data: Date | string): string => {
    if (data instanceof Date) {
      const year = data.getFullYear();
      const month = String(data.getMonth() + 1).padStart(2, '0');
      const day = String(data.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (typeof data === 'string') {
      return data.split('T')[0];
    } else {
      const dateObj = new Date(data);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const dataOriginal = converterDataParaString(agendamento.data);

  const temMudancas = 
    statusEditado !== agendamento.status || 
    observacaoEditada !== (agendamento.observacao || "") ||
    dataEditada !== dataOriginal ||
    horarioEditado !== agendamento.horario ||
    servicoEditado !== agendamento.servico.id ||
    profissionalEditado !== agendamento.profissional.id;

  const handleSave = () => {
    if (onSave) {
      onSave({
        status: statusEditado,
        observacao: observacaoEditada || undefined,
        data: dataEditada,
        horario: horarioEditado,
        servicoId: servicoEditado,
        profissionalId: profissionalEditado,
      });
    }
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

  const servicoSelecionado = servicos.find((s) => s.id === servicoEditado);
  const profissionalSelecionado = profissionais.find((p) => p.id === profissionalEditado);

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
        className="h-full w-[500px] max-w-[500px] border-r-0 data-[vaul-drawer-direction=right]:w-[500px] data-[vaul-drawer-direction=right]:max-w-[500px]"
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
                  {servicoSelecionado?.nome || agendamento.servico.nome}
                </DrawerTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{dataEditada ? formatDate(dataEditada) : formatDate(agendamento.data)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    <span>{horarioEditado || agendamento.horario}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(servicoSelecionado?.duracao || agendamento.servico.duracao)}</span>
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
                          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors mb-1"
                        >
                          <Phone className="h-4 w-4" />
                          <span>{formatPhone(agendamento.cliente.telefone)}</span>
                        </a>
                      )}
                      {agendamento.cliente.email && (
                        <a
                          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors"
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
              <Select
                value={statusEditado}
                onValueChange={(value) => setStatusEditado(value)}
              >
                <SelectTrigger 
                  className={cn(
                    "w-fit rounded-full px-3 py-1.5 h-auto border-2 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2",
                    statusInfo.color
                  )}
                >
                  <StatusIcon className={cn("h-4 w-4", statusInfo.iconColor)} />
                  <SelectValue>
                    {statusInfo.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    if (key === "scheduled" || key === "cancelled" || key === "completed" || key === "no-show" || key === "pendente") {
                      return null; // Ignora status legados
                    }
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", config.iconColor)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Seção Data */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                DATA
              </label>
              <DatePicker
                value={dataEditada}
                onChange={(date) => setDataEditada(date)}
                placeholder="Selecione a data"
                minDate={new Date()}
              />
            </div>

            {/* Seção Horário */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                HORÁRIO
              </label>
              <Select
                value={horarioEditado}
                onValueChange={(value) => setHorarioEditado(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
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

            {/* Seção Serviço */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                SERVIÇO
              </label>
              <Select
                value={servicoEditado}
                onValueChange={(value) => setServicoEditado(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome} ({servico.duracao}min - R$ {servico.preco.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {servicoSelecionado && (
                <p className="text-xs text-muted-foreground">
                  Duração: {formatDuration(servicoSelecionado.duracao)}
                </p>
              )}
            </div>

            {/* Seção Profissional */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                PROFISSIONAL RESPONSÁVEL
              </label>
              <Select
                value={profissionalEditado}
                onValueChange={(value) => setProfissionalEditado(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: prof.cor }}
                        />
                        {prof.nome} - {prof.especialidade}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profissionalSelecionado && (
                <div className="flex items-center gap-3 mt-2">
                  <Avatar className="h-10 w-10 border-2 border-purple-300">
                    <AvatarFallback 
                      className="text-white text-xs"
                      style={{ backgroundColor: profissionalSelecionado.cor }}
                    >
                      {getIniciais(profissionalSelecionado.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {profissionalSelecionado.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profissionalSelecionado.especialidade}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seção Observação */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                OBSERVAÇÃO DO AGENDAMENTO
              </label>
              <Card>
                <CardContent>
                  <Textarea
                    value={observacaoEditada}
                    onChange={(e) => setObservacaoEditada(e.target.value)}
                    placeholder="Nenhuma observação registrada"
                    className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer - Ações */}
          <DrawerFooter className="border-t border-border pt-4">
            <div className="space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={!temMudancas}
              >
                <Edit className="h-4 w-4 mr-2" />
                Salvar alterações
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
