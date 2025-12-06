import { format } from "date-fns";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const formatMonthYear = (date: Date): string => {
  const mes = meses[date.getMonth()];
  const ano = date.getFullYear();
  return `${mes} ${ano}`;
};

