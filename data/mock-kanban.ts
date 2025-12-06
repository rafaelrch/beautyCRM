export interface KanbanCard {
  id: string;
  clienteNome: string;
  servico: string;
  horario: string;
  profissional: string;
  status: string;
  columnId: string;
  order: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  order: number;
}

export const mockKanbanColumns: KanbanColumn[] = [
  { id: "pendiente", title: "Pendente", status: "scheduled", order: 0 },
  { id: "em-contato", title: "Confirmado", status: "scheduled", order: 1 },
  { id: "cancelado", title: "Cancelado", status: "cancelled", order: 2 },
  { id: "concluido", title: "Concluido", status: "completed", order: 3 },
];

// Mock cards removidos - os cards agora vêm dos agendamentos reais
export const mockKanbanCards: KanbanCard[] = [];

export const getColumnColor = (status: string): string => {
  const colors: Record<string, string> = {
    scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

