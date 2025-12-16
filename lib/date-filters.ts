import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
} from "date-fns";

export type PeriodFilter =
  | "hoje"
  | "ultimos-7-dias"
  | "este-mes"
  | "mes-passado"
  | "este-ano";

export interface PeriodDates {
  start: Date;
  end: Date;
}

export function getPeriodDates(period: PeriodFilter): PeriodDates {
  const today = new Date();

  switch (period) {
    case "hoje":
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };

    case "ultimos-7-dias":
      return {
        start: startOfDay(subDays(today, 6)),
        end: endOfDay(today),
      };

    case "este-mes":
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };

    case "mes-passado": {
      const lastMonth = subMonths(today, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    }

    case "este-ano":
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      };

    default:
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
  }
}

