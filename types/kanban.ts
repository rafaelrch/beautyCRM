export interface KanbanCard {
  id: string;
  clienteNome: string;
  servico: string;
  horario: string;
  data?: Date;
  profissional: string;
  status: string;
  columnId: string;
  order: number;
  valor?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  order: number;
}

export const defaultKanbanColumns: KanbanColumn[] = [
  { id: "pendiente", title: "Pendente", status: "scheduled", order: 0 },
  { id: "confirmado", title: "Confirmado", status: "confirmed", order: 1 },
  { id: "concluido", title: "Concluído", status: "completed", order: 2 },
  { id: "nao_compareceu", title: "Não Compareceu", status: "no-show", order: 3 },
  { id: "cancelado", title: "Cancelado", status: "cancelled", order: 4 },
];

export const getColumnColor = (status: string): string => {
  const colors: Record<string, string> = {
    scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    "no-show": "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};



