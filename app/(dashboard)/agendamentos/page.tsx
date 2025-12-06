"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CalendarioMensal } from "@/components/calendario/CalendarioMensal";
import { ModalCriarAgendamento } from "@/components/calendario/ModalCriarAgendamento";
import { DrawerDetalhes } from "@/components/calendario/DrawerDetalhes";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthYear } from "@/lib/dateHelpers";
import { mockKanbanColumns, type KanbanCard as KanbanCardType, type KanbanColumn as KanbanColumnType } from "@/data/mock-kanban";
import { storage, initializeStorage } from "@/lib/storage";
import { mockClients, mockServices, mockTransactions, mockAppointments, mockProducts, mockMovements, mockSalonConfig } from "@/data";
import { mockProfissionais } from "@/data/professionals";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth } from "date-fns";
import type { Appointment, Client, Service } from "@/types";

interface AgendamentoFormatado {
  id: string;
  horario: string;
  nomeCliente: string;
  nomeServico: string;
  corProfissional: string;
  status: string;
  duracao: number;
  data: Date;
  clienteId: string;
  profissionalId: string;
  servicoId: string;
  observacao?: string;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [servicos, setServicos] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<AgendamentoFormatado | null>(null);
  const [dataPreSelecionada, setDataPreSelecionada] = useState<Date | undefined>();
  const [agendamentoEditando, setAgendamentoEditando] = useState<any>(null);
  const [filtroProfissional, setFiltroProfissional] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("all");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "kanban">("calendar");
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumnType[]>(mockKanbanColumns);
  const [kanbanMesAtual, setKanbanMesAtual] = useState(new Date());

  useEffect(() => {
    initializeStorage({
      clients: mockClients,
      services: mockServices,
      transactions: mockTransactions,
      products: mockProducts,
      appointments: mockAppointments,
      movements: mockMovements,
      salonConfig: mockSalonConfig,
    });
    const loadedAppointments = storage.get<Appointment>("appointments");
    const loadedClients = storage.get<Client>("clients");
    const loadedServices = storage.get<Service>("services");
    
    setAgendamentos(loadedAppointments);
    setClientes(loadedClients);
    setServicos(loadedServices);
  }, []);

  const formatarAgendamentos = (): AgendamentoFormatado[] => {
    return agendamentos
      .map((apt) => {
        const cliente = clientes.find((c) => c.id === apt.clientId);
        const servico = servicos.find((s) => apt.serviceIds.includes(s.id));
        const profissional = mockProfissionais.find((p) => p.id === apt.professionalId);

        if (!cliente || !servico || !profissional) return null;

        const [hora, minuto] = apt.startTime.split(":").map(Number);
        const horarioFormatado = `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`;

        // Garantir que a data seja um objeto Date válido
        let dataAgendamento: Date;
        if (apt.date instanceof Date) {
          dataAgendamento = apt.date;
        } else if (typeof apt.date === 'string') {
          // Se for string, criar Date no timezone local
          const [ano, mes, dia] = apt.date.split('T')[0].split('-').map(Number);
          dataAgendamento = new Date(ano, mes - 1, dia);
        } else {
          dataAgendamento = new Date(apt.date);
        }

        return {
          id: apt.id,
          horario: horarioFormatado,
          nomeCliente: cliente.name,
          nomeServico: servico.name,
          corProfissional: profissional.cor,
          status: apt.status,
          duracao: servico.duration,
          data: dataAgendamento,
          clienteId: apt.clientId,
          profissionalId: apt.professionalId,
          servicoId: servico.id,
          observacao: apt.notes,
        };
      })
      .filter((apt): apt is AgendamentoFormatado => apt !== null);
  };

  const agendamentosFormatados = formatarAgendamentos();

  // Converter agendamentos para formato Kanban
  // Os status reais do sistema são: 'scheduled', 'completed', 'cancelled', 'no-show'
  // Mapeamos para as colunas do Kanban: Pendiente, Confirmado, Cancelado, Concluido
  const mapStatusToColumn = (status: string, columnId?: string): string => {
    // Se já tem columnId e é válido, manter
    if (columnId && mockKanbanColumns.find(col => col.id === columnId)) {
      return columnId;
    }
    
    const statusMap: Record<string, string> = {
      scheduled: "pendiente", // scheduled -> pendiente (padrão)
      completed: "concluido", // completed -> concluido
      cancelled: "cancelado", // cancelled -> cancelado
      "no-show": "cancelado", // no-show -> cancelado (tratado como cancelado)
    };
    return statusMap[status] || "pendiente";
  };

  const agendamentosToKanbanCards = (): KanbanCardType[] => {
    return agendamentosFormatados.map((apt, index) => {
      // Verificar se o appointment tem um columnId armazenado (em notes ou metadata)
      const appointment = agendamentos.find((a) => a.id === apt.id);
      let columnId = mapStatusToColumn(apt.status);
      
      // Tentar extrair columnId das notes se existir (formato: "kanbanColumnId:em-contato")
      if (appointment?.notes) {
        const columnMatch = appointment.notes.match(/kanbanColumnId:([a-z-]+)/);
        if (columnMatch && mockKanbanColumns.find(col => col.id === columnMatch[1])) {
          columnId = columnMatch[1];
        }
      }
      
      const profissional = mockProfissionais.find((p) => p.id === apt.profissionalId);
      
      return {
        id: apt.id,
        clienteNome: apt.nomeCliente,
        servico: apt.nomeServico,
        horario: apt.horario,
        profissional: profissional?.nome || "Não definido",
        status: apt.status,
        columnId,
        order: index,
      };
    });
  };

  const kanbanCards = agendamentosToKanbanCards();

  const agendamentosFiltrados = agendamentosFormatados.filter((apt) => {
    const matchProfissional =
      filtroProfissional.length === 0 || filtroProfissional.includes(apt.profissionalId);
    const matchStatus = filtroStatus === "all" || apt.status === filtroStatus;
    const matchBusca =
      buscaCliente === "" ||
      apt.nomeCliente.toLowerCase().includes(buscaCliente.toLowerCase());

    return matchProfissional && matchStatus && matchBusca;
  });

  const handleCriarAgendamento = (data?: Date) => {
    setDataPreSelecionada(data);
    setAgendamentoEditando(null);
    setIsModalOpen(true);
  };

  const handleSalvarAgendamento = (dados: any) => {
    // Criar data no horário local para evitar problemas de timezone
    // dados.data está no formato "YYYY-MM-DD"
    const [ano, mes, dia] = dados.data.split("-").map(Number);
    const dataLocal = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
    
    const novoAgendamento: Appointment = {
      id: dados.id || crypto.randomUUID(),
      clientId: dados.clienteId,
      serviceIds: [dados.servicoId],
      professionalId: dados.profissionalId,
      date: dataLocal,
      startTime: dados.horario,
      endTime: calcularHorarioFim(dados.horario, dados.servicoId),
            status: dados.status === "concluido" ? "completed" : dados.status === "confirmado" ? "scheduled" : dados.status === "pendente" ? "scheduled" : "cancelled",
      totalAmount: servicos.find((s) => s.id === dados.servicoId)?.price || 0,
      notes: dados.observacao || "",
    };

    if (dados.id) {
      storage.update<Appointment>("appointments", dados.id, novoAgendamento);
    } else {
      storage.add<Appointment>("appointments", novoAgendamento);
    }

    setAgendamentos(storage.get<Appointment>("appointments"));
    setIsModalOpen(false);
  };

  const calcularHorarioFim = (horario: string, servicoId: string): string => {
    const servico = servicos.find((s) => s.id === servicoId);
    if (!servico) return horario;

    const [hora, minuto] = horario.split(":").map(Number);
    const totalMinutos = hora * 60 + minuto + servico.duration;
    const horaFim = Math.floor(totalMinutos / 60);
    const minutoFim = totalMinutos % 60;

    return `${horaFim.toString().padStart(2, "0")}:${minutoFim.toString().padStart(2, "0")}`;
  };

  const handleAgendamentoClick = (agendamento: AgendamentoFormatado) => {
    // Garantir que temos todos os dados necessários
    const cliente = clientes.find((c) => c.id === agendamento.clienteId);
    const profissional = mockProfissionais.find((p) => p.id === agendamento.profissionalId);
    
    if (!cliente || !profissional) {
      console.error("Dados incompletos:", { cliente, profissional, agendamento });
      return;
    }
    
    setAgendamentoSelecionado(agendamento);
    setIsDrawerOpen(true);
  };

  const handleEditar = () => {
    if (!agendamentoSelecionado) return;

    const agendamentoOriginal = agendamentos.find((a) => a.id === agendamentoSelecionado.id);
    if (!agendamentoOriginal) return;

    setAgendamentoEditando({
      id: agendamentoSelecionado.id,
      clienteId: agendamentoSelecionado.clienteId,
      profissionalId: agendamentoSelecionado.profissionalId,
      servicoId: agendamentoSelecionado.servicoId,
      data: format(agendamentoSelecionado.data, "yyyy-MM-dd"),
      horario: agendamentoSelecionado.horario,
            status: agendamentoSelecionado.status === "completed" ? "concluido" : agendamentoSelecionado.status === "scheduled" ? "confirmado" : agendamentoSelecionado.status === "cancelled" ? "cancelado" : "pendente",
      observacao: agendamentoSelecionado.observacao,
    });

    setIsDrawerOpen(false);
    setIsModalOpen(true);
  };

  const handleCancelar = () => {
    if (!agendamentoSelecionado) return;
    storage.update<Appointment>("appointments", agendamentoSelecionado.id, {
      status: "cancelled",
    });
    setAgendamentos(storage.get<Appointment>("appointments"));
    setIsDrawerOpen(false);
  };

  const handleConcluir = () => {
    if (!agendamentoSelecionado) return;
    storage.update<Appointment>("appointments", agendamentoSelecionado.id, {
      status: "completed",
    });
    setAgendamentos(storage.get<Appointment>("appointments"));
    setIsDrawerOpen(false);
  };

  const agendamentosExistentes = agendamentosFormatados.map((apt) => ({
    profissionalId: apt.profissionalId,
    data: format(apt.data, "yyyy-MM-dd"),
    horario: apt.horario,
    duracao: apt.duracao,
  }));

  const clientesFormatados = clientes.map((c) => ({
    id: c.id,
    nome: c.name,
    telefone: c.phone,
    email: c.email,
  }));

  const servicosFormatados = servicos.map((s) => ({
    id: s.id,
    nome: s.name,
    duracao: s.duration,
    preco: s.price,
  }));

  const profissionaisFormatados = mockProfissionais.map((p) => ({
    id: p.id,
    nome: p.nome,
    cor: p.cor,
    especialidade: p.especialidade,
  }));

  const detalhesAgendamento = agendamentoSelecionado
    ? {
        id: agendamentoSelecionado.id,
        horario: agendamentoSelecionado.horario,
        data: agendamentoSelecionado.data,
        cliente: {
          nome: agendamentoSelecionado.nomeCliente,
          telefone: clientes.find((c) => c.id === agendamentoSelecionado?.clienteId)?.phone || "",
          email: clientes.find((c) => c.id === agendamentoSelecionado?.clienteId)?.email || "",
        },
        servico: {
          nome: agendamentoSelecionado.nomeServico,
          duracao: agendamentoSelecionado.duracao,
        },
        profissional: {
          nome: mockProfissionais.find((p) => p.id === agendamentoSelecionado?.profissionalId)?.nome || "",
          cor: agendamentoSelecionado.corProfissional,
          especialidade: mockProfissionais.find((p) => p.id === agendamentoSelecionado?.profissionalId)?.especialidade || "",
        },
        status: agendamentoSelecionado.status,
        observacao: agendamentoSelecionado.observacao,
      }
    : null;

  // Mapear coluna do Kanban para status do sistema
  const mapColumnToStatus = (columnId: string): 'scheduled' | 'completed' | 'cancelled' | 'no-show' => {
    const columnMap: Record<string, 'scheduled' | 'completed' | 'cancelled' | 'no-show'> = {
      pendiente: "scheduled",
      "em-contato": "scheduled", // Confirmado também usa scheduled
      concluido: "completed",
      cancelado: "cancelled",
    };
    return columnMap[columnId] || "scheduled";
  };

  // Handlers para Kanban
  const handleKanbanCardChange = (updatedCards: KanbanCardType[]) => {
    // Atualizar agendamentos baseado nas mudanças do Kanban
    updatedCards.forEach((kanbanCard) => {
      const appointment = agendamentos.find((apt) => apt.id === kanbanCard.id);
      if (appointment) {
        const newStatus = mapColumnToStatus(kanbanCard.columnId);
        
        // Preservar notes existentes e adicionar/atualizar columnId
        let notes = appointment.notes || "";
        // Remover columnId antigo se existir
        notes = notes.replace(/kanbanColumnId:[a-z-]+\s*/g, "");
        // Adicionar novo columnId se não for a coluna padrão para o status
        const defaultColumn = mapStatusToColumn(newStatus);
        if (kanbanCard.columnId !== defaultColumn) {
          notes = (notes + " kanbanColumnId:" + kanbanCard.columnId).trim();
        }
        
        storage.update<Appointment>("appointments", appointment.id, {
          status: newStatus,
          notes: notes,
        });
      }
    });
    setAgendamentos(storage.get<Appointment>("appointments"));
  };

  const handleKanbanAddCard = (columnId: string) => {
    const column = kanbanColumns.find((col) => col.id === columnId);
    if (column) {
      // Abrir modal de criação com status pré-selecionado
      handleCriarAgendamento();
    }
  };

  const handleKanbanEditCard = (kanbanCard: KanbanCardType) => {
    const appointment = agendamentos.find((apt) => apt.id === kanbanCard.id);
    if (appointment) {
      const agendamentoFormatado = agendamentosFormatados.find((apt) => apt.id === kanbanCard.id);
      if (agendamentoFormatado) {
        setAgendamentoEditando({
          id: appointment.id,
          clienteId: appointment.clientId,
          profissionalId: appointment.professionalId,
          servicoId: appointment.serviceIds[0],
          data: format(new Date(appointment.date), "yyyy-MM-dd"),
          horario: appointment.startTime,
                status: appointment.status === "completed" ? "concluido" : appointment.status === "scheduled" ? "confirmado" : appointment.status === "cancelled" ? "cancelado" : "pendente",
          observacao: appointment.notes || "",
        });
        setIsModalOpen(true);
      }
    }
  };

  const handleKanbanDeleteCard = (cardId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      storage.delete<Appointment>("appointments", cardId);
      setAgendamentos(storage.get<Appointment>("appointments"));
    }
  };

  const handleKanbanViewCard = (kanbanCard: KanbanCardType) => {
    const agendamentoFormatado = agendamentosFormatados.find((apt) => apt.id === kanbanCard.id);
    if (agendamentoFormatado) {
      setAgendamentoSelecionado(agendamentoFormatado);
      setIsDrawerOpen(true);
    }
  };

  const handleKanbanAddColumn = () => {
    // Por enquanto, não permitir adicionar colunas customizadas
    // As colunas são fixas baseadas nos status dos agendamentos
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden max-w-full">
      <Header
        title="Agendamentos"
        actionLabel="Criar Agendamento"
        onAction={() => handleCriarAgendamento()}
        onFilter={() => setIsFilterDialogOpen(true)}
        showFilter={true}
      />

      {/* Tabs para alternar entre visualizações */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "kanban")} className="w-full overflow-x-hidden max-w-full">
        <TabsList className="bg-white">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <CalendarioMensal
              agendamentos={agendamentosFiltrados}
              onDiaClick={(data) => handleCriarAgendamento(data)}
              onAgendamentoClick={handleAgendamentoClick}
              onAgendamentoDoubleClick={handleAgendamentoClick}
            />
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="mt-6 -mx-5 px-5 w-full overflow-x-hidden max-w-full">
          <div className="bg-white rounded-xl border border-border p-0 min-h-[calc(100vh-300px)] w-full overflow-hidden max-w-full">
            {/* Header de navegação do mês */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setKanbanMesAtual(subMonths(kanbanMesAtual, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {formatMonthYear(kanbanMesAtual)}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => setKanbanMesAtual(addMonths(kanbanMesAtual, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setKanbanMesAtual(new Date())}>
                    Hoje
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 w-full overflow-x-hidden max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
              <KanbanBoard
              columns={kanbanColumns}
              cards={kanbanCards
                .filter((card) => {
                  const agendamentoFormatado = agendamentosFormatados.find((apt) => apt.id === card.id);
                  if (!agendamentoFormatado) return false;
                  
                  // Filtrar por mês
                  const matchMes = isSameMonth(agendamentoFormatado.data, kanbanMesAtual);
                  
                  const matchProfissional =
                    filtroProfissional.length === 0 || filtroProfissional.includes(agendamentoFormatado.profissionalId);
                  const matchStatus = filtroStatus === "all" || agendamentoFormatado.status === filtroStatus;
                  const matchBusca =
                    buscaCliente === "" ||
                    agendamentoFormatado.nomeCliente.toLowerCase().includes(buscaCliente.toLowerCase());

                  return matchMes && matchProfissional && matchStatus && matchBusca;
                })
                .map((card, index) => ({
                  ...card,
                  order: index,
                }))}
              onColumnsChange={setKanbanColumns}
              onCardsChange={handleKanbanCardChange}
              onAddCard={handleKanbanAddCard}
              onEditCard={handleKanbanEditCard}
              onDeleteCard={handleKanbanDeleteCard}
              onViewCardDetails={handleKanbanViewCard}
              onAddColumn={handleKanbanAddColumn}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Criar/Editar */}
      <ModalCriarAgendamento
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAgendamentoEditando(null);
          setDataPreSelecionada(undefined);
        }}
        onSave={handleSalvarAgendamento}
        clientes={clientesFormatados}
        servicos={servicosFormatados}
        profissionais={profissionaisFormatados}
        dataPreSelecionada={dataPreSelecionada}
        agendamentoEditando={agendamentoEditando}
        agendamentosExistentes={agendamentosExistentes}
      />

      {/* Drawer Detalhes */}
      {detalhesAgendamento && (
        <DrawerDetalhes
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setAgendamentoSelecionado(null);
          }}
          agendamento={detalhesAgendamento}
          onEdit={handleEditar}
          onCancel={handleCancelar}
          onComplete={handleConcluir}
        />
      )}

      {/* Dialog de Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtrar Agendamentos</DialogTitle>
            <DialogDescription>
              Selecione os filtros para visualizar os agendamentos desejados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Busca por Cliente */}
            <div className="space-y-2">
              <Label htmlFor="busca-cliente" className="mb-[3px]">Buscar por Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca-cliente"
                  type="search"
                  placeholder="Buscar por cliente..."
                  className="pl-9"
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                />
              </div>
            </div>

            {/* Filtro por Status */}
            <div className="space-y-2">
              <Label htmlFor="filtro-status" className="mb-[3px]">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="filtro-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Profissional */}
            <div className="space-y-3">
              <Label className="mb-[3px]">Filtrar por Profissional</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {mockProfissionais.map((prof) => (
                  <div key={prof.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`prof-${prof.id}`}
                      checked={filtroProfissional.includes(prof.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFiltroProfissional([...filtroProfissional, prof.id]);
                        } else {
                          setFiltroProfissional(filtroProfissional.filter((id) => id !== prof.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`prof-${prof.id}`}
                      className="text-sm cursor-pointer flex items-center gap-2 flex-1"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: prof.cor }}
                      />
                      <span>{prof.nome}</span>
                      <span className="text-xs text-muted-foreground">({prof.especialidade})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFiltroStatus("all");
                setFiltroProfissional([]);
                setBuscaCliente("");
              }}
            >
              Limpar Filtros
            </Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

