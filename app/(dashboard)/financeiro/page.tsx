"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Search, Filter, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { storage, initializeStorage } from "@/lib/storage";
import { mockClients, mockServices, mockTransactions, mockAppointments, mockProducts, mockMovements, mockSalonConfig } from "@/data";
import { startOfMonth, isSameDay, subDays } from "date-fns";
import type { Transaction } from "@/types";

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    initializeStorage({
      clients: mockClients,
      services: mockServices,
      transactions: mockTransactions,
      products: mockProducts,
      appointments: mockAppointments,
      movements: mockMovements,
      salonConfig: mockSalonConfig,
    });
    setTransactions(storage.get<Transaction>("transactions"));
  }, []);

  const today = new Date();
  const thisMonth = startOfMonth(today);

  const todayIncome = transactions
    .filter((t) => t.type === "income" && isSameDay(new Date(t.date), today) && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpense = transactions
    .filter((t) => t.type === "expense" && isSameDay(new Date(t.date), today) && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthIncome = transactions
    .filter((t) => t.type === "income" && new Date(t.date) >= thisMonth && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = transactions
    .filter((t) => t.type === "expense" && new Date(t.date) >= thisMonth && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactions = transactions.filter((t) => t.status === "pending");
  const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    storage.add<Transaction>("transactions", {
      id: "",
      date: new Date(formData.get("date") as string),
      type: formData.get("type") as "income" | "expense",
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: parseFloat(formData.get("amount") as string),
      paymentMethod: formData.get("paymentMethod") as Transaction["paymentMethod"],
      status: "completed",
    });

    setTransactions(storage.get<Transaction>("transactions"));
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Header title="Financeiro" actionLabel="+ Nova Transação" onAction={() => setIsDialogOpen(true)} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(todayIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesa Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(todayExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(monthIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthIncome - monthExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar transações..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-border p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>{formatDate(typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date)}</TableCell>
                  <TableCell>
                    {transaction.type === "income" ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {transaction.paymentMethod === "cash" ? "Dinheiro" :
                       transaction.paymentMethod === "credit" ? "Crédito" :
                       transaction.paymentMethod === "debit" ? "Débito" : "PIX"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }
                    >
                      {transaction.status === "completed" ? "Concluída" :
                       transaction.status === "pending" ? "Pendente" : "Cancelada"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTransaction} className="space-y-4">
            <div>
              <Label htmlFor="type" className="mb-[3px]">Tipo *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date" className="mb-[3px]">Data *</Label>
              <DatePicker
                id="date"
                value={new Date()}
                onChange={(date) => {
                  const hiddenInput = document.getElementById("date-hidden") as HTMLInputElement;
                  if (hiddenInput) {
                    hiddenInput.value = date;
                  }
                }}
                placeholder="Selecione a data"
                required
              />
              <input
                type="hidden"
                id="date-hidden"
                name="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="mb-[3px]">Categoria *</Label>
              <Input id="category" name="category" required />
            </div>
            <div>
              <Label htmlFor="description" className="mb-[3px]">Descrição *</Label>
              <Input id="description" name="description" required />
            </div>
            <div>
              <Label htmlFor="amount" className="mb-[3px]">Valor *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="paymentMethod" className="mb-[3px]">Método de Pagamento *</Label>
              <Select name="paymentMethod" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

