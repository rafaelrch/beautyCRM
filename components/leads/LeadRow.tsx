"use client";

import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreVertical, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadTag, type LeadStatus, type LeadSource } from "./LeadTag";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  size: number;
  interest: number[];
  probability: number;
  lastAction: string;
}

interface LeadRowProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export function LeadRow({ lead, isSelected, onSelect }: LeadRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/50 cursor-pointer",
        isSelected && "bg-muted/30"
      )}
    >
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(lead.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{lead.name}</span>
          <span className="text-sm text-muted-foreground">{lead.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <LeadTag source={lead.source} />
      </TableCell>
      <TableCell>
        <LeadTag status={lead.status} />
      </TableCell>
      <TableCell className="font-medium">{formatCurrency(lead.size)}</TableCell>
      <TableCell>
        <Sparkline data={lead.interest} />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
          {lead.probability}%
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDate(lead.lastAction)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-8">
            <Send className="h-3 w-3 mr-1.5" />
            Engage
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

