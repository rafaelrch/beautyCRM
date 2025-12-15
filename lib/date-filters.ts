import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths,
  subDays,
  isWithinInterval
} from "date-fns";

export type PeriodFilter = "hoje" | "ultimos-7-dias" | "este-mes" | "mes-passado" | "este-ano";

export function getPeriodDates(period: PeriodFilter): { start: Date; end: Date } {
  const now = new Date();
  
  switch (period) {
    case "hoje":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    
    case "ultimos-7-dias":
      return {
        start: startOfDay(subDays(now, 6)), // Últimos 7 dias (incluindo hoje)
        end: endOfDay(now),
      };
    
    case "este-mes":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    
    case "mes-passado":
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    
    case "este-ano":
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    
    default:
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
  }
}

export function isDateInPeriod(date: Date, period: PeriodFilter): boolean {
  const { start, end } = getPeriodDates(period);
  return isWithinInterval(date, { start, end });
}

