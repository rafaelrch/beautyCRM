import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  onFilter?: () => void;
  showFilter?: boolean;
}

export function Header({ title, actionLabel = "+ New lead", onAction, onFilter, showFilter = false }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        {showFilter && onFilter && (
          <Button 
            variant="outline" 
            onClick={onFilter}
            className="bg-white hover:bg-gray-50 text-foreground border border-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        )}
        <Button 
          variant="default" 
          onClick={onAction}
          className="bg-[#320fff] hover:bg-[#320fff]/80 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

