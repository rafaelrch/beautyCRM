"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { storage } from "@/lib/storage";
import { mockServices } from "@/data";
import type { Transaction, Appointment, Client } from "@/types";
import { startOfMonth, subDays, format } from "date-fns";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"financial" | "services" | "products" | "clients">("financial");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const transactions = storage.get<Transaction>("transactions");
  const appointments = storage.get<Appointment>("appointments");
  const clients = storage.get<Client>("clients");

  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= new Date(startDate) && new Date(t.date) <= new Date(endDate)
  );

  const filteredAppointments = appointments.filter(
    (a) => new Date(a.date) >= new Date(startDate) && new Date(a.date) <= new Date(endDate)
  );

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpense;

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => row[header] || "").join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere relatórios detalhados do seu salão</p>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${
            reportType === "financial" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setReportType("financial")}
        >
          <CardContent className="p-6 text-center">
            <p className="font-medium">Financeiro</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            reportType === "services" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setReportType("services")}
        >
          <CardContent className="p-6 text-center">
            <p className="font-medium">Serviços</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            reportType === "products" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setReportType("products")}
        >
          <CardContent className="p-6 text-center">
            <p className="font-medium">Produtos</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            reportType === "clients" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() => setReportType("clients")}
        >
          <CardContent className="p-6 text-center">
            <p className="font-medium">Clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="startDate" className="mb-[3px]">Data Inicial</Label>
            <DatePicker
              id="startDate"
              value={startDate ? new Date(startDate) : undefined}
              onChange={(date) => setStartDate(date)}
              placeholder="Selecione a data inicial"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate" className="mb-[3px]">Data Final</Label>
            <DatePicker
              id="endDate"
              value={endDate ? new Date(endDate) : undefined}
              onChange={(date) => setEndDate(date)}
              placeholder="Selecione a data final"
            />
          </div>
          <Button onClick={() => exportToCSV(filteredTransactions, "relatorio.csv")}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportType === "financial" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lucro Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(profit)}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(typeof t.date === 'string' ? new Date(t.date) : t.date)}</TableCell>
                      <TableCell>{t.type === "income" ? "Receita" : "Despesa"}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "services" && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {filteredAppointments.filter((a) => a.status === "completed").length} serviços concluídos no período
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments
                  .filter((a) => a.status === "completed")
                  .map((apt) => {
                    const services = apt.serviceIds
                      .map((id) => mockServices.find((s) => s.id === id))
                      .filter(Boolean);
                    return (
                      <TableRow key={apt.id}>
                        <TableCell>{formatDate(typeof apt.date === 'string' ? new Date(apt.date) : apt.date)}</TableCell>
                        <TableCell>{services.map((s) => s?.name).join(", ")}</TableCell>
                        <TableCell>{formatCurrency(apt.totalAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "clients" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Clientes</p>
                  <p className="text-2xl font-bold">{clients.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                  <p className="text-2xl font-bold">{clients.filter((c) => c.status === "active").length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Novos no Período</p>
                  <p className="text-2xl font-bold">
                    {clients.filter(
                      (c) => new Date(c.registrationDate) >= new Date(startDate) && new Date(c.registrationDate) <= new Date(endDate)
                    ).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

