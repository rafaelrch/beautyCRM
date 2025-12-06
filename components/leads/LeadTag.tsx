import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LeadStatus = "PRE-SALE" | "CLOSED" | "LOST" | "NEW" | "CLOSING";
export type LeadSource = "Website" | "Referral" | "Social Media" | "Email" | "Other";

interface LeadTagProps {
  status?: LeadStatus;
  source?: LeadSource;
  className?: string;
}

const statusColors: Record<LeadStatus, string> = {
  "PRE-SALE": "bg-orange-100 text-orange-700 border-orange-200",
  "CLOSED": "bg-green-100 text-green-700 border-green-200",
  "LOST": "bg-red-100 text-red-700 border-red-200",
  "NEW": "bg-purple-100 text-purple-700 border-purple-200",
  "CLOSING": "bg-blue-100 text-blue-700 border-blue-200",
};

export function LeadTag({ status, source, className }: LeadTagProps) {
  if (status) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-medium",
          statusColors[status],
          className
        )}
      >
        {status}
      </Badge>
    );
  }

  if (source) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border-gray-200",
          className
        )}
      >
        {source}
      </Badge>
    );
  }

  return null;
}

