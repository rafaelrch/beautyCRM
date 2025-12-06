"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { KpiCard } from "@/components/kpi/KpiCard";
import { LeadTable } from "@/components/leads/LeadTable";
import type { Lead } from "@/components/leads/LeadRow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    source: "Website",
    status: "NEW",
    size: 5000,
    interest: [20, 25, 30, 35, 40, 45, 50],
    probability: 75,
    lastAction: "2024-01-15",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@example.com",
    source: "Referral",
    status: "PRE-SALE",
    size: 12000,
    interest: [60, 65, 70, 75, 80, 85, 90],
    probability: 90,
    lastAction: "2024-01-14",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    source: "Social Media",
    status: "CLOSING",
    size: 8000,
    interest: [40, 45, 50, 55, 60, 65, 70],
    probability: 85,
    lastAction: "2024-01-13",
  },
  {
    id: "4",
    name: "David Thompson",
    email: "d.thompson@example.com",
    source: "Email",
    status: "CLOSED",
    size: 15000,
    interest: [80, 85, 90, 95, 100, 100, 100],
    probability: 100,
    lastAction: "2024-01-12",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    source: "Website",
    status: "LOST",
    size: 3000,
    interest: [50, 45, 40, 35, 30, 25, 20],
    probability: 20,
    lastAction: "2024-01-11",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "j.wilson@example.com",
    source: "Referral",
    status: "NEW",
    size: 6000,
    interest: [30, 35, 40, 45, 50, 55, 60],
    probability: 70,
    lastAction: "2024-01-10",
  },
];

export default function LeadsPage() {
  const [dateFilter, setDateFilter] = useState("Last 7 days");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header title="Leads" />

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard title="New" value="24" percentage={12} trend="up" />
        <KpiCard title="Closed" value="18" percentage={-5} trend="down" />
        <KpiCard title="Lost" value="6" percentage={-10} trend="down" />
        <KpiCard title="Total closed" value="$125K" percentage={8} trend="up" />
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {dateFilter}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setDateFilter("Last 7 days")}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("Last 30 days")}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("Last 90 days")}>
                Last 90 days
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-border p-4">
        <div className="flex items-center gap-4">
          <Tabs defaultValue="list" className="w-auto">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Switch id="group" />
            <label htmlFor="group" className="text-sm text-muted-foreground cursor-pointer">
              Group
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search leads..."
              className="w-64 pl-9"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-border p-6">
        <LeadTable leads={mockLeads} />
      </div>
    </div>
  );
}

