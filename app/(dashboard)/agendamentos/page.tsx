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
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { CalendarIcon, CalendarDaysIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon as CalendarDaysIconSolid, ViewColumnsIcon as ViewColumnsIconSolid } from "@heroicons/react/24/solid";
import { formatMonthYear } from "@/lib/dateHelpers";
import { defaultKanbanColumns, type KanbanCard as KanbanCardType, type KanbanColumn as KanbanColumnType } from "@/types/kanban";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, startOfWeek, endOfWeek, addWeeks, addDays, isWithinInterval } from "date-fns";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getClients, getServices, getProfessionals } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Appointment, Client, Service } from "@/types";

interface AgendamentoFormatado {
  id: string;
  horario: string;
  nomeCliente: string;
  nomeServico: string;
  corProfissional: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu" | string;
  duracao: number;
  data: Date;
  clienteId: string;
  profissionalId: string;
  servicoId: string;
  observacao?: string;
}

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type ProfessionalRow = Database["public"]["Tables"]["professionals"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [servicos, setServicos] = useState<Service[]>([]);
  const [profissionais, setProfissionais] = useState<ProfessionalRow[]>([]);
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
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumnType[]>(defaultKanbanColumns);
  const [kanbanMesAtual, setKanbanMesAtual] = useState(new Date());
  const [kanbanFiltroData, setKanbanFiltroData] = useState<"hoje" | "esta-semana" | "proxima-semana" | "mes-inteiro">("hoje");
  const [kanbanCardsOptimistic, setKanbanCardsOptimistic] = useState<KanbanCardType[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados do Supabase
      const [appointmentsData, clientsData, servicesData, professionalsData] = await Promise.all([
        getAppointments(),
        getClients(),
        getServices(),
        getProfessionals(),
      ]);

      // Converter agendamentos do Supabase para o formato Appointment
      const formattedAppointments: Appointment[] = appointmentsData.map((apt: AppointmentRow) => {
        // Converter data
        let appointmentDate: Date;
        if (typeof apt.date === 'string') {
          if (apt.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = apt.date.split('-').map(Number);
            appointmentDate = new Date(year, month - 1, day);
          } else {
            appointmentDate = new Date(apt.date);
          }
        } else {
          appointmentDate = new Date(apt.date);
        }

        // Calcular totalAmount (soma dos preços dos serviços)
        // Por enquanto, vamos usar 0 e calcular depois quando tivermos os serviços
        const totalAmount = 0;

        return {
          id: apt.id,
          clientId: apt.client_id,
          serviceIds: apt.service_ids || [],
          professionalId: apt.professional_id,
          date: appointmentDate,
          startTime: apt.start_time,
          endTime: apt.end_time,
          status: apt.status || 'scheduled',
          totalAmount: totalAmount,
          notes: apt.notes || "",
        } as Appointment;
      });

      // Converter clientes do Supabase
      const formattedClients: Client[] = clientsData.map((client: ClientRow) => {
        // Converter birthdate
        let birthdateDate: Date;
        if (client.birthdate) {
          if (typeof client.birthdate === 'string') {
            if (client.birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = client.birthdate.split('-').map(Number);
              birthdateDate = new Date(year, month - 1, day);
            } else {
              birthdateDate = new Date(client.birthdate);
            }
          } else {
            birthdateDate = new Date(client.birthdate);
          }
        } else {
          birthdateDate = new Date();
        }

        return {
          id: client.id,
          name: client.name,
          phone: client.phone || "",
          email: client.email || "",
          birthdate: birthdateDate,
          address: client.address || "",
          cpf: client.cpf || "",
          registrationDate: new Date(client.registration_date),
          lastVisit: client.last_visit ? new Date(client.last_visit) : null,
          totalSpent: Number(client.total_spent || 0),
          totalVisits: Number(client.total_visits || 0),
          notes: client.notes || "",
          status: client.status as 'active' | 'inactive',
        };
      });

      // Converter serviços do Supabase
      const formattedServices: Service[] = servicesData.map((service: ServiceRow) => ({
        id: service.id,
        name: service.name,
        category: service.category as 'hair' | 'nails' | 'aesthetics' | 'makeup' | 'massage',
        duration: Number(service.duration),
        price: Number(service.price),
        description: service.description || "",
        professionalIds: service.professional_ids || [],
        active: service.active,
      }));

      // Calcular totalAmount dos agendamentos baseado nos serviços
      formattedAppointments.forEach(apt => {
        const services = apt.serviceIds.map(id => formattedServices.find(s => s.id === id)).filter(Boolean) as Service[];
        apt.totalAmount = services.reduce((sum, s) => sum + s.price, 0);
      });

      setAgendamentos(formattedAppointments);
      setClientes(formattedClients);
      setServicos(formattedServices);
      setProfissionais(professionalsData);
      // Limpar estado otimista após recarregar dados
      setKanbanCardsOptimistic(null);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar agendamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatarAgendamentos = (): AgendamentoFormatado[] => {
    const resultado: AgendamentoFormatado[] = [];
    
    agendamentos.forEach((apt) => {
      const cliente = clientes.find((c) => c.id === apt.clientId);
      const servico = servicos.find((s) => {
        if (!apt.serviceIds || apt.serviceIds.length === 0) return false;
        return apt.serviceIds.includes(s.id);
      });
      const profissional = profissionais.find((p) => p.id === apt.professionalId);

      if (!cliente || !servico || !profissional) return;

      const startTimeStr = typeof apt.startTime === 'string' ? apt.startTime : String(apt.startTime);
      const [hora, minuto] = startTimeStr.split(":").map(Number);
      const horarioFormatado = `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`;

      // Garantir que a data seja um objeto Date válido
      let dataAgendamento: Date;
      if (apt.date instanceof Date) {
        dataAgendamento = apt.date;
      } else {
        // Se for string ou outro tipo, converter para Date
        const dateValue = String(apt.date);
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          const [ano, mes, dia] = dateValue.split('T')[0].split('-').map(Number);
          dataAgendamento = new Date(ano, mes - 1, dia);
        } else {
          dataAgendamento = new Date(apt.date);
        }
      }

      resultado.push({
        id: apt.id,
        horario: horarioFormatado,
        nomeCliente: cliente.name,
        nomeServico: servico.name,
        corProfissional: profissional.color || "#6366f1",
        status: apt.status as "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu" | string,
        duracao: servico.duration,
        data: dataAgendamento,
        clienteId: apt.clientId,
        profissionalId: apt.professionalId,
        servicoId: servico.id,
        observacao: apt.notes,
      });
    });
    
    return resultado;
  };

  const agendamentosFormatados = formatarAgendamentos();

  // ============================================================================
  // IMPORTANTE: Sincronização entre Calendário e Kanban
  // ============================================================================
  // Os mesmos agendamentos são exibidos tanto no Calendário quanto no Kanban.
  // Ambos compartilham:
  // - A mesma fonte de dados: agendamentosFormatados
  // - Os mesmos filtros: profissional, status, busca por cliente
  // - As mesmas atualizações: quando um agendamento é modificado em uma visualização,
  //   a outra também é atualizada automaticamente
  // 
  // A única diferença é que o Kanban também filtra por mês selecionado,
  // enquanto o Calendário mostra todos os meses visíveis na tela.
  // ============================================================================

  // Converter agendamentos para formato Kanban
  // Os status reais do sistema são: 'agendado', 'confirmado', 'concluido', 'cancelado', 'nao_compareceu'
  // Mapeamos para as colunas do Kanban: Pendiente, Confirmado, Concluido, Não Compareceu, Cancelado
  const mapStatusToColumn = (status: string, columnId?: string): string => {
    // Se já tem columnId e é válido, manter
    if (columnId && defaultKanbanColumns.find(col => col.id === columnId)) {
      return columnId;
    }
    
    const statusMap: Record<string, string> = {
      agendado: "pendiente", // agendado -> pendiente
      confirmado: "confirmado", // confirmado -> confirmado
      concluido: "concluido", // concluido -> concluido
      cancelado: "cancelado", // cancelado -> cancelado
      nao_compareceu: "nao_compareceu", // nao_compareceu -> nao_compareceu
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
        if (columnMatch && defaultKanbanColumns.find(col => col.id === columnMatch[1])) {
          columnId = columnMatch[1];
        }
      }
      
      const profissional = profissionais.find((p) => p.id === apt.profissionalId);
      
      return {
        id: apt.id,
        clienteNome: apt.nomeCliente,
        servico: apt.nomeServico,
        horario: apt.horario,
        data: apt.data, // Adicionar data do agendamento
        profissional: profissional?.name || "Não definido",
        profissionalCor: profissional?.color || "#6366f1",
        status: apt.status,
        columnId,
        order: index,
        valor: appointment?.totalAmount || 0, // Adicionar valor total do serviço
      };
    });
  };

  // Função para obter intervalo de datas baseado no filtro selecionado
  const obterIntervaloData = (
    filtro: "hoje" | "esta-semana" | "proxima-semana" | "mes-inteiro",
    mesSelecionado?: Date
  ) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    switch (filtro) {
      case "hoje":
        return { inicio: hoje, fim: hoje };
      
      case "esta-semana": {
        const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 }); // Segunda-feira
        const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 });
        return { inicio: inicioSemana, fim: fimSemana };
      }
      
      case "proxima-semana": {
        const proximaSegunda = addWeeks(startOfWeek(hoje, { weekStartsOn: 1 }), 1);
        const fimProximaSemana = endOfWeek(proximaSegunda, { weekStartsOn: 1 });
        return { inicio: proximaSegunda, fim: fimProximaSemana };
      }
      
      case "mes-inteiro": {
        // Usar o mês selecionado no kanbanMesAtual ou o mês atual
        const mesParaUsar = mesSelecionado || hoje;
        const inicioMes = startOfMonth(mesParaUsar);
        const fimMes = endOfMonth(mesParaUsar);
        return { inicio: inicioMes, fim: fimMes };
      }
      
      default:
        return { inicio: hoje, fim: hoje };
    }
  };

  // Função para filtrar agendamentos (usada tanto no calendário quanto no kanban)
  const filtrarAgendamentos = (
    agendamentos: AgendamentoFormatado[], 
    incluirFiltroData?: boolean, 
    filtroData?: "hoje" | "esta-semana" | "proxima-semana" | "mes-inteiro",
    mesSelecionado?: Date
  ) => {
    return agendamentos.filter((apt) => {
      const matchProfissional =
        filtroProfissional.length === 0 || filtroProfissional.includes(apt.profissionalId);
      const matchStatus = filtroStatus === "all" || apt.status === filtroStatus;
      const matchBusca =
        buscaCliente === "" ||
        apt.nomeCliente.toLowerCase().includes(buscaCliente.toLowerCase());
      
      // Filtro de data (usado apenas no kanban)
      let matchData = true;
      if (incluirFiltroData && filtroData) {
        const intervalo = obterIntervaloData(filtroData, mesSelecionado);
        const dataAgendamento = new Date(apt.data);
        dataAgendamento.setHours(0, 0, 0, 0);
        
        if (filtroData === "hoje") {
          matchData = isSameDay(dataAgendamento, intervalo.inicio);
        } else {
          matchData = isWithinInterval(dataAgendamento, {
            start: intervalo.inicio,
            end: intervalo.fim,
          });
        }
      }

      return matchProfissional && matchStatus && matchBusca && matchData;
    });
  };

  const agendamentosFiltrados = filtrarAgendamentos(agendamentosFormatados);

  const kanbanCardsBase = agendamentosToKanbanCards();
  // Usar estado otimista se existir, senão usar os cards calculados
  const kanbanCards = kanbanCardsOptimistic || kanbanCardsBase;

  const handleCriarAgendamento = (data?: Date) => {
    setDataPreSelecionada(data);
    setAgendamentoEditando(null);
    setIsModalOpen(true);
  };

  // IMPORTANTE: Quando um agendamento é criado ou editado, ele aparece tanto no Calendário quanto no Kanban
  // porque ambos compartilham a mesma fonte de dados (agendamentos state)
  const handleSalvarAgendamento = async (dados: any) => {
    try {
      // Criar data no horário local para evitar problemas de timezone
      // dados.data está no formato "YYYY-MM-DD"
      const [ano, mes, dia] = dados.data.split("-").map(Number);
      const dataLocal = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
      
      const servico = servicos.find((s) => s.id === dados.servicoId);
      const endTime = calcularHorarioFim(dados.horario, dados.servicoId);
      
      // Mapear status do formulário para o status do banco
      const statusMap: Record<string, string> = {
        "concluido": "concluido",
        "confirmado": "confirmado",
        "pendente": "agendado",
        "agendado": "agendado",
        "cancelado": "cancelado",
        "nao_compareceu": "nao_compareceu",
      };
      const status = statusMap[dados.status] || "agendado";

      if (dados.id) {
        // Atualizar agendamento existente
        await updateAppointment(dados.id, {
          client_id: dados.clienteId,
          professional_id: dados.profissionalId,
          service_ids: [dados.servicoId],
          date: format(dataLocal, "yyyy-MM-dd"),
          start_time: dados.horario,
          end_time: endTime,
          status: status as "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu",
          notes: dados.observacao || null,
        } as any);
        
        toast({
          title: "Sucesso",
          description: "Agendamento atualizado com sucesso!",
        });
      } else {
        // Criar novo agendamento
        await createAppointment({
          client_id: dados.clienteId,
          professional_id: dados.profissionalId,
          service_ids: [dados.servicoId],
          date: format(dataLocal, "yyyy-MM-dd"),
          start_time: dados.horario,
          end_time: endTime,
          status: status as "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu",
          notes: dados.observacao || null,
        } as any);
        
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso!",
        });
      }

      // Recarregar dados
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar agendamento",
        variant: "destructive",
      });
    }
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
    const profissional = profissionais.find((p) => p.id === agendamento.profissionalId);
    
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

    // Mapear status do banco para o status do formulário
    const statusMap: Record<string, string> = {
      "agendado": "agendado",
      "confirmado": "confirmado",
      "concluido": "concluido",
      "cancelado": "cancelado",
      "nao_compareceu": "nao_compareceu",
    };
    
    setAgendamentoEditando({
      id: agendamentoSelecionado.id,
      clienteId: agendamentoSelecionado.clienteId,
      profissionalId: agendamentoSelecionado.profissionalId,
      servicoId: agendamentoSelecionado.servicoId,
      data: format(agendamentoSelecionado.data, "yyyy-MM-dd"),
      horario: agendamentoSelecionado.horario,
      status: statusMap[agendamentoSelecionado.status] || "agendado",
      observacao: agendamentoSelecionado.observacao,
    });

    setIsDrawerOpen(false);
    setIsModalOpen(true);
  };

  const handleSaveDrawer = async (dados: { 
    status: string; 
    observacao?: string;
    data?: string;
    horario?: string;
    servicoId?: string;
    profissionalId?: string;
  }) => {
    if (!agendamentoSelecionado) return;

    try {
      // Mapear status do formulário para o status do banco
      const statusMap: Record<string, string> = {
        "concluido": "concluido",
        "confirmado": "confirmado",
        "pendente": "agendado",
        "agendado": "agendado",
        "cancelado": "cancelado",
        "nao_compareceu": "nao_compareceu",
      };
      const status = statusMap[dados.status] || "agendado";

      // Calcular endTime se horário ou serviço mudou
      let endTime = undefined;
      if (dados.horario || dados.servicoId) {
        const servicoId = dados.servicoId || agendamentoSelecionado.servicoId;
        const horario = dados.horario || agendamentoSelecionado.horario;
        endTime = calcularHorarioFim(horario, servicoId);
      }

      // Criar objeto de atualização
      const updateData: any = {
        status: status as "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu",
        notes: dados.observacao || null,
      };

      // Adicionar campos que mudaram
      if (dados.data) {
        const [ano, mes, dia] = dados.data.split("-").map(Number);
        const dataLocal = new Date(ano, mes - 1, dia);
        updateData.date = format(dataLocal, "yyyy-MM-dd");
      }

      if (dados.horario) {
        updateData.start_time = dados.horario;
      }

      if (dados.servicoId) {
        updateData.service_ids = [dados.servicoId];
      }

      if (dados.profissionalId) {
        updateData.professional_id = dados.profissionalId;
      }

      if (endTime) {
        updateData.end_time = endTime;
      }

      await updateAppointment(agendamentoSelecionado.id, updateData);
      
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });
      
      await loadData();
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar alterações",
        variant: "destructive",
      });
    }
  };

  // IMPORTANTE: Mudanças de status também atualizam tanto o Calendário quanto o Kanban
  const handleCancelar = async () => {
    if (!agendamentoSelecionado) return;
    try {
      await updateAppointment(agendamentoSelecionado.id, {
        status: "cancelado",
      } as any);
      
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso!",
      });
      
      await loadData();
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleConcluir = async () => {
    if (!agendamentoSelecionado) return;
    try {
      await updateAppointment(agendamentoSelecionado.id, {
        status: "concluido",
      } as any);
      
      toast({
        title: "Sucesso",
        description: "Agendamento concluído com sucesso!",
      });
      
      await loadData();
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao concluir agendamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgendamento = async () => {
    if (!agendamentoSelecionado) return;
    try {
      await deleteAppointment(agendamentoSelecionado.id);
      
      toast({
        title: "Sucesso",
        description: "Agendamento deletado com sucesso!",
      });
      
      await loadData();
      setIsDrawerOpen(false);
      setAgendamentoSelecionado(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar agendamento",
        variant: "destructive",
      });
    }
  };

  const agendamentosExistentes = agendamentosFormatados.map((apt) => ({
    profissionalId: apt.profissionalId,
    data: format(apt.data, "yyyy-MM-dd"),
    horario: apt.horario,
    duracao: apt.duracao,
  }));

  const clientesFormatados = clientes
    .filter((c) => c.status === "active")
    .map((c) => ({
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

  const profissionaisFormatados = profissionais.map((p) => ({
    id: p.id,
    nome: p.name,
    cor: p.color || "#6366f1",
    especialidade: Array.isArray(p.specialties) ? p.specialties.join(", ") : (p.specialties || ""),
  }));

  const detalhesAgendamento = agendamentoSelecionado
    ? {
        id: agendamentoSelecionado.id,
        horario: agendamentoSelecionado.horario,
        data: agendamentoSelecionado.data,
        cliente: {
          id: agendamentoSelecionado.clienteId,
          nome: agendamentoSelecionado.nomeCliente,
          telefone: clientes.find((c) => c.id === agendamentoSelecionado?.clienteId)?.phone || "",
          email: clientes.find((c) => c.id === agendamentoSelecionado?.clienteId)?.email || "",
        },
        servico: {
          id: agendamentoSelecionado.servicoId,
          nome: agendamentoSelecionado.nomeServico,
          duracao: agendamentoSelecionado.duracao,
        },
        profissional: {
          id: agendamentoSelecionado.profissionalId,
          nome: profissionais.find((p) => p.id === agendamentoSelecionado?.profissionalId)?.name || "",
          cor: agendamentoSelecionado.corProfissional,
          especialidade: (() => {
            const prof = profissionais.find((p) => p.id === agendamentoSelecionado?.profissionalId);
            if (!prof) return "";
            const specialties = prof.specialties;
            return Array.isArray(specialties) ? specialties.join(", ") : (specialties || "");
          })(),
        },
        status: agendamentoSelecionado.status as "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu",
        observacao: agendamentoSelecionado.observacao,
      }
    : null;

  // Mapear coluna do Kanban para status do sistema
  const mapColumnToStatus = (columnId: string): 'agendado' | 'confirmado' | 'concluido' | 'cancelado' | 'nao_compareceu' => {
    const columnMap: Record<string, 'agendado' | 'confirmado' | 'concluido' | 'cancelado' | 'nao_compareceu'> = {
      pendiente: "agendado",
      confirmado: "confirmado",
      concluido: "concluido",
      cancelado: "cancelado",
      nao_compareceu: "nao_compareceu",
    };
    return columnMap[columnId] || "agendado";
  };

  // Handlers para Kanban
  // IMPORTANTE: Quando um agendamento é atualizado no Kanban, ele também é atualizado no Calendário
  // porque ambos compartilham a mesma fonte de dados (agendamentos state)
  const handleKanbanCardChange = async (updatedCards: KanbanCardType[]) => {
    // Salvar estado anterior para possível reversão em caso de erro
    const previousCards = kanbanCards;
    const previousAgendamentos = [...agendamentos];
    
    // Atualização otimista: atualizar estado local imediatamente
    setKanbanCardsOptimistic(updatedCards);
    
    // Atualizar agendamentos localmente também para manter sincronização
    const updatedAgendamentos = agendamentos.map((apt) => {
      const updatedCard = updatedCards.find((card) => card.id === apt.id);
      if (updatedCard) {
        const newStatus = mapColumnToStatus(updatedCard.columnId);
        
        // Preservar notes existentes e adicionar/atualizar columnId
        let notes = apt.notes || "";
        // Remover columnId antigo se existir
        notes = notes.replace(/kanbanColumnId:[a-z-]+\s*/g, "");
        // Adicionar novo columnId se não for a coluna padrão para o status
        const defaultColumn = mapStatusToColumn(newStatus);
        if (updatedCard.columnId !== defaultColumn) {
          notes = (notes + " kanbanColumnId:" + updatedCard.columnId).trim();
        }
        
        return {
          ...apt,
          status: newStatus as any,
          notes: notes || "",
        };
      }
      return apt;
    });
    
    setAgendamentos(updatedAgendamentos);
    
    // Sincronizar com backend em segundo plano (sem bloquear UI)
    try {
      const updates = updatedCards.map(async (kanbanCard) => {
        const appointment = previousAgendamentos.find((apt) => apt.id === kanbanCard.id);
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
          
          await updateAppointment(appointment.id, {
            status: newStatus,
            notes: notes || null,
          } as any);
        }
      });
      
      await Promise.all(updates);
      
      // Limpar estado otimista após sucesso - os cards serão recalculados normalmente
      setKanbanCardsOptimistic(null);
    } catch (error: any) {
      // Reverter mudanças em caso de erro
      setKanbanCardsOptimistic(null);
      setAgendamentos(previousAgendamentos);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar agendamento. As mudanças foram revertidas.",
        variant: "destructive",
      });
    }
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
        // Mapear status do banco para o status do formulário
        const statusMap: Record<string, string> = {
          "agendado": "agendado",
          "confirmado": "confirmado",
          "concluido": "concluido",
          "cancelado": "cancelado",
          "nao_compareceu": "nao_compareceu",
        };
        
        setAgendamentoEditando({
          id: appointment.id,
          clienteId: appointment.clientId,
          profissionalId: appointment.professionalId,
          servicoId: appointment.serviceIds[0],
          data: format(new Date(appointment.date), "yyyy-MM-dd"),
          horario: appointment.startTime,
          status: statusMap[appointment.status] || "agendado",
          observacao: appointment.notes || "",
        });
        setIsModalOpen(true);
      }
    }
  };

  const handleKanbanDeleteCard = async (cardId: string) => {
    try {
      await deleteAppointment(cardId);
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });
      await loadData();
      // Limpar estado otimista após recarregar dados
      setKanbanCardsOptimistic(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir agendamento",
        variant: "destructive",
      });
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
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "kanban")} className="w-full max-w-full">
        <div className="flex justify-start py-2 px-4 -mx-4">
          <TabsList>
            <TabsTrigger value="calendar">
              {viewMode === "calendar" ? (
                <CalendarDaysIconSolid className="size-4" />
              ) : (
                <CalendarIcon className="size-4" />
              )}
              Calendário
            </TabsTrigger>
            <TabsTrigger value="kanban">
              {viewMode === "kanban" ? (
                <ViewColumnsIconSolid className="size-4" />
              ) : (
                <ViewColumnsIcon className="size-4" />
              )}
              Kanban
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="mt-6">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-6">
              <CalendarioMensal
                agendamentos={agendamentosFiltrados.map(apt => ({
                  id: apt.id,
                  horario: apt.horario,
                  nomeCliente: apt.nomeCliente,
                  nomeServico: apt.nomeServico,
                  corProfissional: apt.corProfissional,
                  status: apt.status,
                  duracao: apt.duracao,
                  data: apt.data,
                }))}
                onDiaClick={(data) => handleCriarAgendamento(data)}
                onAgendamentoClick={(agendamento) => {
                  const aptFormatado = agendamentosFormatados.find(a => a.id === agendamento.id);
                  if (aptFormatado) {
                    handleAgendamentoClick(aptFormatado);
                  }
                }}
                onAgendamentoDoubleClick={(agendamento) => {
                  const aptFormatado = agendamentosFormatados.find(a => a.id === agendamento.id);
                  if (aptFormatado) {
                    handleAgendamentoClick(aptFormatado);
                  }
                }}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-6 -mx-5 px-5 w-full overflow-x-hidden max-w-full">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-0 min-h-[calc(100vh-300px)] w-full overflow-hidden max-w-full">
            {/* Header de navegação do mês */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Navegação de mês (apenas para "Mês inteiro") */}
                  {kanbanFiltroData === "mes-inteiro" && (
                    <>
                      <Button variant="outline" size="icon" onClick={() => setKanbanMesAtual(subMonths(kanbanMesAtual, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-xl font-semibold">
                        {formatMonthYear(kanbanMesAtual)}
                      </h2>
                      <Button variant="outline" size="icon" onClick={() => setKanbanMesAtual(addMonths(kanbanMesAtual, 1))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Título para outros filtros */}
                  {kanbanFiltroData !== "mes-inteiro" && (
                    <h2 className="text-xl font-semibold">
                      {kanbanFiltroData === "hoje" && "Hoje"}
                      {kanbanFiltroData === "esta-semana" && "Esta semana"}
                      {kanbanFiltroData === "proxima-semana" && "Próxima semana"}
                    </h2>
                  )}
                  
                  {/* Dropdown de filtro de data */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        {kanbanFiltroData === "hoje" && "Hoje"}
                        {kanbanFiltroData === "esta-semana" && "Esta semana"}
                        {kanbanFiltroData === "proxima-semana" && "Próxima semana"}
                        {kanbanFiltroData === "mes-inteiro" && "Mês inteiro"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setKanbanFiltroData("hoje");
                        setKanbanMesAtual(new Date());
                      }}>
                        Hoje
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setKanbanFiltroData("esta-semana");
                        setKanbanMesAtual(new Date());
                      }}>
                        Esta semana
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setKanbanFiltroData("proxima-semana");
                        setKanbanMesAtual(new Date());
                      }}>
                        Próxima semana
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setKanbanFiltroData("mes-inteiro");
                        setKanbanMesAtual(new Date());
                      }}>
                        Mês inteiro
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <div className="p-6 w-full overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
              <KanbanBoard
              columns={kanbanColumns}
              cards={(() => {
                // Filtrar agendamentos formatados com os mesmos filtros do calendário + filtro de data
                const agendamentosFiltradosKanban = filtrarAgendamentos(
                  agendamentosFormatados, 
                  true, 
                  kanbanFiltroData,
                  kanbanMesAtual
                );
                const idsFiltrados = new Set(agendamentosFiltradosKanban.map(apt => apt.id));
                
                // Filtrar cards do kanban baseado nos agendamentos filtrados
                return kanbanCards
                  .filter((card) => idsFiltrados.has(card.id))
                  .map((card, index) => ({
                    ...card,
                    order: index,
                  }));
              })()}
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
          )}
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
          clientes={clientesFormatados}
          servicos={servicosFormatados}
          profissionais={profissionaisFormatados}
          onSave={handleSaveDrawer}
          onCancel={handleCancelar}
          onComplete={handleConcluir}
          onDelete={handleDeleteAgendamento}
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
                  <SelectItem value="agendado">Agendados</SelectItem>
                  <SelectItem value="confirmado">Confirmados</SelectItem>
                  <SelectItem value="concluido">Concluídos</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                  <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Profissional */}
            <div className="space-y-3">
              <Label className="mb-[3px]">Filtrar por Profissional</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {profissionais.map((prof) => (
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
                        style={{ backgroundColor: prof.color || "#6366f1" }}
                      />
                      <span>{prof.name}</span>
                      <span className="text-xs text-muted-foreground">({prof.specialties?.join(", ") || "Sem especialidade"})</span>
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

