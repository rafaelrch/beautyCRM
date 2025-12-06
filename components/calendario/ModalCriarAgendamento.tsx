"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
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

interface Agendamento {
  id?: string;
  clienteId: string;
  profissionalId: string;
  servicoId: string;
  data: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado" | "concluido";
  observacao?: string;
}

interface ModalCriarAgendamentoProps {
  open: boolean;
  onClose: () => void;
  onSave: (agendamento: Agendamento) => void;
  clientes: Cliente[];
  servicos: Servico[];
  profissionais: Profissional[];
  dataPreSelecionada?: Date;
  agendamentoEditando?: Agendamento;
  agendamentosExistentes?: Array<{ profissionalId: string; data: string; horario: string; duracao: number }>;
}

export function ModalCriarAgendamento({
  open,
  onClose,
  onSave,
  clientes,
  servicos,
  profissionais,
  dataPreSelecionada,
  agendamentoEditando,
  agendamentosExistentes = [],
}: ModalCriarAgendamentoProps) {
  const [formData, setFormData] = useState<Agendamento>({
    clienteId: "",
    profissionalId: "",
    servicoId: "",
    data: dataPreSelecionada ? format(dataPreSelecionada, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    horario: "09:00",
    status: "pendente",
    observacao: "",
  });

  const [conflito, setConflito] = useState<string>("");

  useEffect(() => {
    if (agendamentoEditando) {
      setFormData({
        clienteId: agendamentoEditando.clienteId,
        profissionalId: agendamentoEditando.profissionalId,
        servicoId: agendamentoEditando.servicoId,
        data: agendamentoEditando.data,
        horario: agendamentoEditando.horario,
        status: agendamentoEditando.status,
        observacao: agendamentoEditando.observacao || "",
      });
    } else if (dataPreSelecionada) {
      setFormData((prev) => ({
        ...prev,
        data: format(dataPreSelecionada, "yyyy-MM-dd"),
      }));
    }
  }, [agendamentoEditando, dataPreSelecionada]);

  const servicoSelecionado = servicos.find((s) => s.id === formData.servicoId);
  const duracaoServico = servicoSelecionado?.duracao || 0;

  const verificarConflito = () => {
    if (!formData.profissionalId || !formData.data || !formData.horario || !duracaoServico) {
      setConflito("");
      return;
    }

    const [horaInicio, minutoInicio] = formData.horario.split(":").map(Number);
    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const fimMinutos = inicioMinutos + duracaoServico;

    const conflitoEncontrado = agendamentosExistentes.find((apt) => {
      if (apt.profissionalId !== formData.profissionalId || apt.data !== formData.data) {
        return false;
      }

      const [aptHora, aptMinuto] = apt.horario.split(":").map(Number);
      const aptInicioMinutos = aptHora * 60 + aptMinuto;
      const aptFimMinutos = aptInicioMinutos + apt.duracao;

      return (
        (inicioMinutos >= aptInicioMinutos && inicioMinutos < aptFimMinutos) ||
        (fimMinutos > aptInicioMinutos && fimMinutos <= aptFimMinutos) ||
        (inicioMinutos <= aptInicioMinutos && fimMinutos >= aptFimMinutos)
      );
    });

    if (conflitoEncontrado) {
      setConflito("Conflito de horário! Este profissional já tem um agendamento neste horário.");
    } else {
      setConflito("");
    }
  };

  useEffect(() => {
    verificarConflito();
  }, [formData.profissionalId, formData.data, formData.horario, duracaoServico]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflito) return;

    if (agendamentoEditando?.id) {
      onSave({ ...formData, id: agendamentoEditando.id });
    } else {
      onSave(formData);
    }
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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamentoEditando ? "Editar Agendamento" : "Criar Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {agendamentoEditando 
              ? "Atualize as informações do agendamento abaixo."
              : "Preencha os dados para criar um novo agendamento."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente" className="mb-[3px]">Cliente *</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="servico" className="mb-[3px]">Serviço *</Label>
              <Select
                value={formData.servicoId}
                onValueChange={(value) => setFormData({ ...formData, servicoId: value })}
                required
              >
                <SelectTrigger>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Duração: {servicoSelecionado.duracao} minutos
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="profissional" className="mb-[3px]">Profissional *</Label>
              <Select
                value={formData.profissionalId}
                onValueChange={(value) => setFormData({ ...formData, profissionalId: value })}
                required
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="data" className="mb-[3px]">Data *</Label>
              <DatePicker
                id="data"
                value={formData.data}
                onChange={(date) => setFormData({ ...formData, data: date })}
                placeholder="Selecione a data"
                minDate={new Date()}
                required
              />
            </div>

            <div>
              <Label htmlFor="horario" className="mb-[3px]">Horário *</Label>
              <Select
                value={formData.horario}
                onValueChange={(value) => setFormData({ ...formData, horario: value })}
                required
              >
                <SelectTrigger>
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

            <div>
              <Label htmlFor="status" className="mb-[3px]">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observacao" className="mb-[3px]">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={3}
            />
          </div>

          {conflito && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {conflito}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!!conflito}>
              {agendamentoEditando ? "Atualizar" : "Salvar"} Agendamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

