export interface KanbanCard {
  id: string;
  clienteNome: string;
  servico: string;
  horario: string;
  data?: Date; // Data do agendamento
  profissional: string;
  status: string;
  columnId: string;
  order: number;
  valor?: number; // Valor total do serviço
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  order: number;
}

export const mockKanbanColumns: KanbanColumn[] = [
  { id: "pendiente", title: "Pendente", status: "agendado", order: 0 },
  { id: "confirmado", title: "Confirmado", status: "confirmado", order: 1 },
  { id: "concluido", title: "Concluido", status: "concluido", order: 2 },
  { id: "nao_compareceu", title: "Não Compareceu", status: "nao_compareceu", order: 3 },
  { id: "cancelado", title: "Cancelado", status: "cancelado", order: 4 },
];

// Mock cards removidos - os cards agora vêm dos agendamentos reais
export const mockKanbanCards: KanbanCard[] = [];

export const getColumnColor = (status: string): string => {
  const colors: Record<string, string> = {
    agendado: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmado: "bg-blue-100 text-blue-800 border-blue-200",
    concluido: "bg-green-100 text-green-800 border-green-200",
    cancelado: "bg-red-100 text-red-800 border-red-200",
    nao_compareceu: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

