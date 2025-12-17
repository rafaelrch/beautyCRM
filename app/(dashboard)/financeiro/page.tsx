"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Filter, Plus, ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, Wallet, Loader2, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getServices, getClients, updateClient, getProducts, getProfessionals, updateProduct, createStockMovement } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, isSameDay, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { Transaction } from "@/types";
import type { Database } from "@/types/database";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProfessionalRow = Database["public"]["Tables"]["professionals"]["Row"];

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [dateFilterStart, setDateFilterStart] = useState<Date | undefined>();
  const [dateFilterEnd, setDateFilterEnd] = useState<Date | undefined>();
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalRow[]>([]);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  
  // Switches para alternar visualização
  const [incomeMode, setIncomeMode] = useState<"cliente" | "produto">("cliente");
  const [expenseMode, setExpenseMode] = useState<"estoque" | "salario">("estoque");
  
  // Estados para campos condicionais
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quantity, setQuantity] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<string>("0");
  const [nonRegisteredClientName, setNonRegisteredClientName] = useState<string>("");
  const [isClientRegistered, setIsClientRegistered] = useState<boolean>(true);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
    loadServices();
    loadClients();
    loadProducts();
    loadProfessionals();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data.filter((s: ServiceRow) => s.active));
    } catch (error: any) {
      console.error("Erro ao carregar serviços:", error);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data.filter((c: ClientRow) => c.status === "active"));
    } catch (error: any) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.filter((p: ProductRow) => Number(p.quantity) > 0)); // Só produtos com estoque
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const data = await getProfessionals();
      setProfessionals(data.filter((p: ProfessionalRow) => p.active));
    } catch (error: any) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  // Função para atualizar o total_spent de um cliente baseado nas transações
  const updateClientTotalSpent = async (clientId: string) => {
    try {
      // Buscar todas as transações de receita do cliente
      const allTransactions = await getTransactions();
      const clientTransactions = allTransactions.filter(
        (t: TransactionRow) => 
          t.client_id === clientId && 
          t.type === "income" && 
          t.status === "completed"
      );

      // Calcular o total
      const totalSpent = clientTransactions.reduce(
        (sum: number, t: TransactionRow) => sum + (Number(t.amount) || 0),
        0
      );

      // Atualizar o cliente
      await updateClient(clientId, {
        total_spent: totalSpent,
      });
    } catch (error: any) {
      console.error(`Erro ao atualizar total_spent do cliente ${clientId}:`, error);
      // Não lançar erro para não quebrar o fluxo principal
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await getTransactions();
      // Converter dados do Supabase para o formato esperado
      const formattedTransactions: Transaction[] = data.map((transaction: TransactionRow) => {
        // Converter data string (YYYY-MM-DD) para Date no timezone local
        let transactionDate: Date;
        if (typeof transaction.date === 'string') {
          // Se for apenas data sem hora, criar Date no timezone local
          if (transaction.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = transaction.date.split('-').map(Number);
            transactionDate = new Date(year, month - 1, day);
          } else {
            transactionDate = new Date(transaction.date);
          }
        } else {
          transactionDate = new Date(transaction.date);
        }
        
        return {
          id: transaction.id,
          date: transactionDate,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          amount: Number(transaction.amount),
          paymentMethod: transaction.payment_method,
          clientId: transaction.client_id || undefined,
          serviceIds: transaction.service_ids || undefined,
          status: transaction.status,
        };
      });
      
      // Ordenar por data decrescente (mais recentes primeiro)
      formattedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(formattedTransactions);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar transações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Obter categorias únicas das transações
  const categorias = Array.from(new Set(transactions.map(t => t.category))).sort();
  const categoriasServicos = categorias.filter(c => c.startsWith("Serviços"));
  const categoriasProdutos = categorias.filter(c => !c.startsWith("Serviços"));

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || 
      (categoryFilter === "servicos" && categoriasServicos.includes(t.category)) ||
      (categoryFilter === "produtos" && categoriasProdutos.includes(t.category)) ||
      (categoryFilter !== "all" && categoryFilter !== "servicos" && categoryFilter !== "produtos" && t.category === categoryFilter);
    const matchesPaymentMethod = paymentMethodFilter === "all" || t.paymentMethod === paymentMethodFilter;
    
    // Filtro de data
    let matchesDate = true;
    if (dateFilterStart || dateFilterEnd) {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      
      if (dateFilterStart && dateFilterEnd) {
        matchesDate = isWithinInterval(transactionDate, {
          start: startOfDay(dateFilterStart),
          end: endOfDay(dateFilterEnd),
        });
      } else if (dateFilterStart) {
        matchesDate = transactionDate >= startOfDay(dateFilterStart);
      } else if (dateFilterEnd) {
        matchesDate = transactionDate <= endOfDay(dateFilterEnd);
      }
    }
    
    return matchesType && matchesCategory && matchesPaymentMethod && matchesDate;
  });

  const handleSaveTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const dateValue = formData.get("date") as string;
      const type = transactionType;
      
      let category = "";
      let serviceIds: string[] = [];
      let productId: string | null = null;
      let quantityValue: number | null = null;
      let discountValue: number | null = null;
      let nonRegisteredClient: string | null = null;
      let professionalId: string | null = null;
      let clientIdForTransaction: string | null = null;
      
      // RECEITA -> CLIENTE
      if (type === "income" && incomeMode === "cliente") {
        if (!selectedClientId) {
          throw new Error("Por favor, selecione um cliente");
        }
        if (!selectedServiceId) {
          throw new Error("Por favor, selecione um serviço");
        }
        const selectedService = services.find(s => s.id === selectedServiceId);
        const selectedClient = clients.find(c => c.id === selectedClientId);
        if (selectedService) {
          category = `Serviços - ${selectedService.name}`;
          serviceIds = [selectedServiceId];
          // Gerar descrição automática se não houver campo de descrição
          if (!formData.get("description")) {
            formData.set("description", `${selectedService.name} - Cliente: ${selectedClient?.name || "N/A"}`);
          }
        } else {
          throw new Error("Serviço selecionado não encontrado");
        }
        clientIdForTransaction = selectedClientId;
      }
      
      // RECEITA -> PRODUTO
      else if (type === "income" && incomeMode === "produto") {
        if (!selectedProductId) {
          throw new Error("Por favor, selecione um produto");
        }
        if (!quantity) {
          throw new Error("Por favor, informe a quantidade vendida");
        }
        
        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (!selectedProduct) {
          throw new Error("Produto selecionado não encontrado");
        }
        
        // Verificar se há estoque suficiente
        if (Number(quantity) > Number(selectedProduct.quantity)) {
          throw new Error(`Quantidade insuficiente em estoque. Disponível: ${selectedProduct.quantity}`);
        }
        
        category = `Venda de Produto - ${selectedProduct.name}`;
        productId = selectedProductId;
        quantityValue = parseFloat(quantity);
        discountValue = parseFloat(discountPercentage) || 0;
        
        // Calcular valor total com desconto
        const totalValue = Number(selectedProduct.sale_price) * quantityValue;
        const finalAmount = totalValue * (1 - (discountValue / 100));
        // Sobrescrever o amount do form com o valor calculado
        formData.set("amount", finalAmount.toFixed(2));
        
        if (isClientRegistered) {
          if (!selectedClientId) {
            throw new Error("Por favor, selecione um cliente cadastrado");
          }
          clientIdForTransaction = selectedClientId;
        } else {
          if (!nonRegisteredClientName) {
            throw new Error("Por favor, informe o nome do cliente");
          }
          nonRegisteredClient = nonRegisteredClientName;
        }
        
        // Criar movimento de estoque (saída) - o trigger do banco de dados atualiza a quantidade automaticamente
        await createStockMovement({
          product_id: selectedProductId,
          type: "out",
          quantity: quantityValue,
          date: dateValue,
          reason: `Venda - Cliente: ${isClientRegistered ? clients.find(c => c.id === selectedClientId)?.name : nonRegisteredClientName}`,
        });
      }
      
      // DESPESA -> ESTOQUE
      else if (type === "expense" && expenseMode === "estoque") {
        if (!selectedProductId) {
          throw new Error("Por favor, selecione um produto");
        }
        if (!quantity) {
          throw new Error("Por favor, informe a quantidade comprada");
        }
        
        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (!selectedProduct) {
          throw new Error("Produto selecionado não encontrado");
        }
        
        category = "Estoque";
        productId = selectedProductId;
        quantityValue = parseFloat(quantity);
        const description = formData.get("description") as string;
        
        // Calcular valor total (custo × quantidade)
        const totalValue = Number(selectedProduct.cost_price) * quantityValue;
        // Sobrescrever o amount do form com o valor calculado
        formData.set("amount", totalValue.toFixed(2));
        
        // Criar movimento de estoque (entrada) - o trigger do banco de dados atualiza a quantidade automaticamente
        await createStockMovement({
          product_id: selectedProductId,
          type: "in",
          quantity: quantityValue,
          date: dateValue,
          reason: description || "Compra para estoque",
        });
      }
      
      // DESPESA -> SALÁRIO
      else if (type === "expense" && expenseMode === "salario") {
        if (!selectedProfessionalId) {
          throw new Error("Por favor, selecione um profissional");
        }
        category = "Salário";
        professionalId = selectedProfessionalId;
      }
      
      // Se for despesa e não tiver categoria definida, pegar do form
      if (type === "expense" && !category) {
        category = formData.get("category") as string;
        if (!category) {
          throw new Error("Por favor, informe a categoria da despesa");
        }
      }

      const amount = parseFloat(formData.get("amount") as string);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Por favor, informe um valor válido");
      }

      const transaction = await createTransaction({
        date: dateValue,
        type: type,
        category: category,
        description: formData.get("description") as string,
        amount: amount,
        payment_method: formData.get("paymentMethod") as "cash" | "credit" | "debit" | "pix",
        status: "completed",
        client_id: clientIdForTransaction,
        service_ids: serviceIds.length > 0 ? serviceIds : undefined,
        product_id: productId,
        quantity: quantityValue,
        discount_percentage: discountValue && discountValue > 0 ? discountValue : null,
        non_registered_client_name: nonRegisteredClient,
        professional_id: professionalId,
      });

      // Atualizar total_spent do cliente se for uma transação de receita com client_id
      if (type === "income" && clientIdForTransaction) {
        await updateClientTotalSpent(clientIdForTransaction);
      }

      // Recarregar produtos para atualizar estoque na UI
      if (type === "income" && incomeMode === "produto" || type === "expense" && expenseMode === "estoque") {
        await loadProducts();
      }

      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!",
      });

      setIsDialogOpen(false);
      setSelectedServiceId("");
      setSelectedClientId("");
      setSelectedProductId("");
      setSelectedProfessionalId("");
      setTransactionType("income");
      setSelectedDate(new Date());
      setQuantity("");
      setDiscountPercentage("0");
      setNonRegisteredClientName("");
      setIsClientRegistered(true);
      setIncomeMode("cliente");
      setExpenseMode("estoque");
      loadTransactions();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar transação",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Financeiro" 
        actionLabel="Nova Transação" 
        onAction={() => setIsDialogOpen(true)}
        onFilter={() => setIsFilterDialogOpen(true)}
        showFilter={true}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Receita Hoje</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(todayIncome)}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Despesa Hoje</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(todayExpense)}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <TrendingDown className="h-12 w-12 text-red-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Receita Mensal</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthIncome)}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <DollarSign className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Saldo Líquido</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthIncome - monthExpense)}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <Wallet className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros ativos */}
      {(typeFilter !== "all" || categoryFilter !== "all" || paymentMethodFilter !== "all" || dateFilterStart || dateFilterEnd) && (
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {typeFilter === "income" ? "Receitas" : "Despesas"}
                <button
                  onClick={() => setTypeFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {categoryFilter === "servicos" ? "Serviços" : 
                 categoryFilter === "produtos" ? "Produtos" : 
                 categoryFilter}
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {paymentMethodFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {paymentMethodFilter === "cash" ? "Dinheiro" :
                 paymentMethodFilter === "credit" ? "Crédito" :
                 paymentMethodFilter === "debit" ? "Débito" : "PIX"}
                <button
                  onClick={() => setPaymentMethodFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {(dateFilterStart || dateFilterEnd) && (
              <Badge variant="secondary" className="gap-1">
                {dateFilterStart && dateFilterEnd 
                  ? `${formatDate(dateFilterStart)} - ${formatDate(dateFilterEnd)}`
                  : dateFilterStart 
                  ? `A partir de ${formatDate(dateFilterStart)}`
                  : `Até ${formatDate(dateFilterEnd!)}`}
                <button
                  onClick={() => {
                    setDateFilterStart(undefined);
                    setDateFilterEnd(undefined);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setPaymentMethodFilter("all");
                setDateFilterStart(undefined);
                setDateFilterEnd(undefined);
              }}
              className="text-xs"
            >
              Limpar todos
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtrar Transações</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Filtro por Tipo */}
            <div className="space-y-2">
              <Label htmlFor="filtro-tipo">Tipo</Label>
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger id="filtro-tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Entrada (Receitas)</SelectItem>
                  <SelectItem value="expense">Saída (Despesas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Categoria */}
            <div className="space-y-2">
              <Label htmlFor="filtro-categoria">Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="filtro-categoria">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="servicos">Serviços</SelectItem>
                  <SelectItem value="produtos">Produtos do Estoque</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Método de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="filtro-pagamento">Método de Pagamento</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger id="filtro-pagamento">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Data */}
            <div className="space-y-4">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-inicio" className="text-xs">Data Início</Label>
                  <DatePicker
                    value={dateFilterStart}
                    onChange={(date: string) => {
                      if (date) {
                        // Criar data no timezone local
                        const [year, month, day] = date.split('-').map(Number);
                        setDateFilterStart(new Date(year, month - 1, day));
                      } else {
                        setDateFilterStart(undefined);
                      }
                    }}
                    placeholder="Selecione a data"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-fim" className="text-xs">Data Fim</Label>
                  <DatePicker
                    value={dateFilterEnd}
                    onChange={(date: string) => {
                      if (date) {
                        // Criar data no timezone local
                        const [year, month, day] = date.split('-').map(Number);
                        setDateFilterEnd(new Date(year, month - 1, day));
                      } else {
                        setDateFilterEnd(undefined);
                      }
                    }}
                    placeholder="Selecione a data"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setPaymentMethodFilter("all");
                setDateFilterStart(undefined);
                setDateFilterEnd(undefined);
              }}
            >
              Limpar Filtros
            </Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>
              Aplicar Filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-border p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      {transaction.type === "income" ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      {transaction.description.length > 10 
                        ? `${transaction.description.substring(0, 10)}...` 
                        : transaction.description}
                    </TableCell>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setTransactionType(transaction.type);
                            
                            // A data já está como Date após loadTransactions
                            const transactionDate = transaction.date instanceof Date 
                              ? transaction.date 
                              : new Date(transaction.date);
                            setSelectedDate(transactionDate);
                            
                            setSelectedClientId(transaction.clientId || "");
                            if (transaction.type === "income" && transaction.serviceIds && transaction.serviceIds.length > 0) {
                              setSelectedServiceId(transaction.serviceIds[0]);
                            } else {
                              setSelectedServiceId("");
                            }
                            setIsDrawerOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setTransactionToDelete(transaction.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Transaction Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Limpar todos os estados
          setSelectedServiceId("");
          setSelectedClientId("");
          setSelectedProductId("");
          setSelectedProfessionalId("");
          setTransactionType("income");
          setSelectedDate(new Date());
          setQuantity("");
          setDiscountPercentage("0");
          setNonRegisteredClientName("");
          setIsClientRegistered(true);
          setIncomeMode("cliente");
          setExpenseMode("estoque");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTransaction} className="space-y-4">
            {/* Tipo de Transação */}
            <div>
              <Label htmlFor="type" className="mb-[3px]">Tipo *</Label>
              <Select 
                name="type" 
                required
                value={transactionType}
                onValueChange={(value) => {
                  setTransactionType(value as "income" | "expense");
                  // Limpar todos os campos ao mudar tipo
                  setSelectedServiceId("");
                  setSelectedClientId("");
                  setSelectedProductId("");
                  setSelectedProfessionalId("");
                  setQuantity("");
                  setDiscountPercentage("0");
                  setNonRegisteredClientName("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RECEITA: Switch Cliente/Produto */}
            {transactionType === "income" && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="income-mode" className="text-sm font-medium">
                  {incomeMode === "cliente" ? "Cliente" : "Produto"}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Cliente</span>
                  <Switch
                    id="income-mode"
                    checked={incomeMode === "produto"}
                    onCheckedChange={(checked) => {
                      setIncomeMode(checked ? "produto" : "cliente");
                      setSelectedServiceId("");
                      setSelectedProductId("");
                      setSelectedClientId("");
                      setQuantity("");
                      setDiscountPercentage("0");
                      setNonRegisteredClientName("");
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Produto</span>
                </div>
              </div>
            )}

            {/* DESPESA: Switch Estoque/Salário */}
            {transactionType === "expense" && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="expense-mode" className="text-sm font-medium">
                  {expenseMode === "estoque" ? "Estoque de Produto" : "Salário"}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estoque</span>
                  <Switch
                    id="expense-mode"
                    checked={expenseMode === "salario"}
                    onCheckedChange={(checked) => {
                      setExpenseMode(checked ? "salario" : "estoque");
                      setSelectedProductId("");
                      setSelectedProfessionalId("");
                      setQuantity("");
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Salário</span>
                </div>
              </div>
            )}

            {/* RECEITA -> CLIENTE */}
            {transactionType === "income" && incomeMode === "cliente" && (
              <>
                <div>
                  <Label htmlFor="date" className="mb-[3px]">Data *</Label>
                  <DatePicker
                    id="date"
                    value={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        const dateObj = new Date(date);
                        setSelectedDate(dateObj);
                        const hiddenInput = document.getElementById("date-hidden") as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = date;
                        }
                      }
                    }}
                    placeholder="Selecione a data"
                    required
                  />
                  <input
                    type="hidden"
                    id="date-hidden"
                    name="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="client-service" className="mb-[3px]">Cliente *</Label>
                  <Select 
                    value={selectedClientId || undefined}
                    onValueChange={(value) => {
                      setSelectedClientId(value);
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum cliente disponível
                        </div>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="service" className="mb-[3px]">Serviço *</Label>
                  <Select 
                    value={selectedServiceId}
                    onValueChange={(value) => {
                      setSelectedServiceId(value);
                      const service = services.find(s => s.id === value);
                      if (service) {
                        const amountInput = document.getElementById("amount") as HTMLInputElement;
                        if (amountInput) {
                          amountInput.value = String(Number(service.price));
                        }
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum serviço disponível
                        </div>
                      ) : (
                        services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(Number(service.price))}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount" className="mb-[3px]">Valor *</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                    key={selectedServiceId}
                    defaultValue={selectedServiceId ? String(Number(services.find(s => s.id === selectedServiceId)?.price || 0)) : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod" className="mb-[3px]">Método de Pagamento *</Label>
                  <Select name="paymentMethod" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      <SelectItem value="debit">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* RECEITA -> PRODUTO */}
            {transactionType === "income" && incomeMode === "produto" && (
              <>
                <div>
                  <Label htmlFor="product-sale" className="mb-[3px]">Produto *</Label>
                  <Select 
                    value={selectedProductId}
                    onValueChange={(value) => {
                      setSelectedProductId(value);
                      setQuantity(""); // Limpar quantidade ao trocar produto
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum produto com estoque disponível
                        </div>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - Estoque: {Number(product.quantity)} - Preço: {formatCurrency(Number(product.sale_price))}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-product" className="mb-[3px]">Data da Venda *</Label>
                  <DatePicker
                    id="date-product"
                    value={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        const dateObj = new Date(date);
                        setSelectedDate(dateObj);
                        const hiddenInput = document.getElementById("date-hidden") as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = date;
                        }
                      }
                    }}
                    placeholder="Selecione a data"
                    required
                  />
                  <input
                    type="hidden"
                    id="date-hidden"
                    name="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <Label htmlFor="client-registered" className="text-sm font-medium">
                    Cliente Cadastrado
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Não</span>
                    <Switch
                      id="client-registered"
                      checked={isClientRegistered}
                      onCheckedChange={(checked) => {
                        setIsClientRegistered(checked);
                        setSelectedClientId("");
                        setNonRegisteredClientName("");
                      }}
                    />
                    <span className="text-sm text-muted-foreground">Sim</span>
                  </div>
                </div>

                {isClientRegistered ? (
                  <div>
                    <Label htmlFor="client-product" className="mb-[3px]">Cliente *</Label>
                    <Select 
                      value={selectedClientId || undefined}
                      onValueChange={(value) => {
                        if (value === "__clear__") {
                          setSelectedClientId("");
                        } else {
                          setSelectedClientId(value);
                        }
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhum cliente disponível
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="non-registered-client" className="mb-[3px]">Nome do Cliente *</Label>
                    <Input 
                      id="non-registered-client"
                      value={nonRegisteredClientName}
                      onChange={(e) => setNonRegisteredClientName(e.target.value)}
                      placeholder="Nome do cliente não cadastrado"
                      required={!isClientRegistered}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description-product" className="mb-[3px]">Descrição *</Label>
                  <Input 
                    id="description-product" 
                    name="description" 
                    required 
                    placeholder="Descrição da venda"
                    defaultValue={
                      selectedProductId 
                        ? `Venda de ${products.find(p => p.id === selectedProductId)?.name || ""}`
                        : ""
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="quantity-sale" className="mb-[3px]">Quantidade Vendida *</Label>
                  <Input 
                    id="quantity-sale"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                    }}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount" className="mb-[3px]">Desconto (%)</Label>
                  <Input 
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => {
                      setDiscountPercentage(e.target.value);
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="amount-product" className="mb-[3px]">Valor Total da Venda *</Label>
                  <Input 
                    id="amount-product" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                    readOnly
                    className="bg-muted font-semibold"
                    value={
                      selectedProductId && quantity
                        ? (() => {
                            const product = products.find(p => p.id === selectedProductId);
                            if (product) {
                              const totalValue = Number(product.sale_price) * Number(quantity);
                              const discount = Number(discountPercentage) || 0;
                              return (totalValue * (1 - discount / 100)).toFixed(2);
                            }
                            return "";
                          })()
                        : ""
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod-product" className="mb-[3px]">Método de Pagamento *</Label>
                  <Select name="paymentMethod" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      <SelectItem value="debit">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* DESPESA -> ESTOQUE */}
            {transactionType === "expense" && expenseMode === "estoque" && (
              <>
                <div>
                  <Label htmlFor="product-stock" className="mb-[3px]">Produto *</Label>
                  <Select 
                    value={selectedProductId}
                    onValueChange={(value) => {
                      setSelectedProductId(value);
                      setQuantity(""); // Limpar quantidade ao trocar produto
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum produto disponível
                        </div>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - Custo: {formatCurrency(Number(product.cost_price))}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description-stock" className="mb-[3px]">Descrição da Despesa *</Label>
                  <Input 
                    id="description-stock" 
                    name="description" 
                    required 
                    placeholder="Ex: Compra de produtos para estoque"
                  />
                  <input
                    type="hidden"
                    name="category"
                    value="Estoque"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity-stock" className="mb-[3px]">Quantidade Comprada *</Label>
                  <Input 
                    id="quantity-stock"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                    }}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date-stock" className="mb-[3px]">Data *</Label>
                  <DatePicker
                    id="date-stock"
                    value={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        const dateObj = new Date(date);
                        setSelectedDate(dateObj);
                        const hiddenInput = document.getElementById("date-hidden") as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = date;
                        }
                      }
                    }}
                    placeholder="Selecione a data"
                    required
                  />
                  <input
                    type="hidden"
                    id="date-hidden"
                    name="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount-stock" className="mb-[3px]">Valor Total da Despesa *</Label>
                  <Input 
                    id="amount-stock" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                    readOnly
                    className="bg-muted font-semibold"
                    value={
                      selectedProductId && quantity
                        ? (() => {
                            const product = products.find(p => p.id === selectedProductId);
                            if (product) {
                              return (Number(product.cost_price) * Number(quantity)).toFixed(2);
                            }
                            return "";
                          })()
                        : ""
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod-stock" className="mb-[3px]">Método de Pagamento *</Label>
                  <Select name="paymentMethod" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      <SelectItem value="debit">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* DESPESA -> SALÁRIO */}
            {transactionType === "expense" && expenseMode === "salario" && (
              <>
                <div>
                  <Label htmlFor="professional" className="mb-[3px]">Profissional *</Label>
                  <Select 
                    value={selectedProfessionalId}
                    onValueChange={(value) => setSelectedProfessionalId(value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum profissional disponível
                        </div>
                      ) : (
                        professionals.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description-salary" className="mb-[3px]">Descrição *</Label>
                  <Input 
                    id="description-salary" 
                    name="description" 
                    required 
                    placeholder="Ex: Pagamento de salário mensal"
                  />
                  <input
                    type="hidden"
                    name="category"
                    value="Salário"
                  />
                </div>

                <div>
                  <Label htmlFor="amount-salary" className="mb-[3px]">Valor do Salário *</Label>
                  <Input 
                    id="amount-salary" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="date-salary" className="mb-[3px]">Data *</Label>
                  <DatePicker
                    id="date-salary"
                    value={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        const dateObj = new Date(date);
                        setSelectedDate(dateObj);
                        const hiddenInput = document.getElementById("date-hidden") as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = date;
                        }
                      }
                    }}
                    placeholder="Selecione a data"
                    required
                  />
                  <input
                    type="hidden"
                    id="date-hidden"
                    name="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod-salary" className="mb-[3px]">Método de Pagamento *</Label>
                  <Select name="paymentMethod" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      <SelectItem value="debit">Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedServiceId("");
                  setSelectedClientId("");
                  setSelectedProductId("");
                  setSelectedProfessionalId("");
                  setTransactionType("income");
                  setSelectedDate(new Date());
                  setQuantity("");
                  setDiscountPercentage("0");
                  setNonRegisteredClientName("");
                  setIsClientRegistered(true);
                  setIncomeMode("cliente");
                  setExpenseMode("estoque");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent className="h-full w-[500px] mt-0">
          <DrawerHeader>
            <DrawerTitle>Editar Transação</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto">
            {editingTransaction && (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  try {
                    const dateValue = formData.get("date") as string;
                    const type = transactionType;
                    
                    let category = "";
                    let serviceIds: string[] = [];
                    
                    if (type === "income") {
                      if (selectedServiceId) {
                        const selectedService = services.find(s => s.id === selectedServiceId);
                        if (selectedService) {
                          category = `Serviços - ${selectedService.name}`;
                          serviceIds = [selectedServiceId];
                        } else {
                          throw new Error("Serviço selecionado não encontrado");
                        }
                      } else {
                        // Se não tiver serviço selecionado, usar a categoria atual
                        category = editingTransaction.category;
                      }
                    } else {
                      category = formData.get("category") as string;
                      if (!category) {
                        throw new Error("Por favor, informe a categoria da despesa");
                      }
                    }

                    const updatedTransaction = await updateTransaction(editingTransaction.id, {
                      date: dateValue,
                      type: type,
                      category: category,
                      description: formData.get("description") as string,
                      amount: parseFloat(formData.get("amount") as string),
                      payment_method: formData.get("paymentMethod") as "cash" | "credit" | "debit" | "pix",
                      client_id: selectedClientId || null,
                      service_ids: serviceIds.length > 0 ? serviceIds : undefined,
                    });

                    // Atualizar total_spent dos clientes afetados (antigo e novo)
                    if (editingTransaction.clientId) {
                      await updateClientTotalSpent(editingTransaction.clientId);
                    }
                    if (selectedClientId && selectedClientId !== editingTransaction.clientId) {
                      await updateClientTotalSpent(selectedClientId);
                    }

                    toast({
                      title: "Sucesso",
                      description: "Transação atualizada com sucesso!",
                    });

                    setIsDrawerOpen(false);
                    setEditingTransaction(null);
                    setSelectedServiceId("");
                    setSelectedClientId("");
                    setTransactionType("income");
                    setSelectedDate(new Date());
                    loadTransactions();
                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message || "Erro ao atualizar transação",
                      variant: "destructive",
                    });
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="edit-type" className="mb-[3px]">Tipo *</Label>
                  <Select 
                    name="type" 
                    required
                    value={transactionType}
                    onValueChange={(value) => {
                      setTransactionType(value as "income" | "expense");
                      setSelectedServiceId("");
                      setSelectedClientId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {transactionType === "income" && (
                  <div>
                    <Label htmlFor="edit-client" className="mb-[3px]">Cliente</Label>
                    <Select 
                      value={selectedClientId || undefined}
                      onValueChange={(value) => {
                        if (value === "__clear__") {
                          setSelectedClientId("");
                        } else {
                          setSelectedClientId(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhum cliente disponível
                          </div>
                        ) : (
                          <>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                            <div className="border-t my-1" />
                            <SelectItem value="__clear__" className="text-muted-foreground">
                              Limpar seleção
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="edit-date" className="mb-[3px]">Data *</Label>
                  <DatePicker
                    id="edit-date"
                    value={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        const dateObj = new Date(date);
                        setSelectedDate(dateObj);
                        const hiddenInput = document.getElementById("edit-date-hidden") as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = date;
                        }
                      }
                    }}
                    placeholder="Selecione a data"
                    required
                  />
                  <input
                    type="hidden"
                    id="edit-date-hidden"
                    name="date"
                    value={selectedDate.toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-category" className="mb-[3px]">Categoria *</Label>
                  {transactionType === "income" ? (
                    <Select 
                      value={selectedServiceId}
                      onValueChange={(value) => {
                        setSelectedServiceId(value);
                        const service = services.find(s => s.id === value);
                        if (service) {
                          const amountInput = document.getElementById("edit-amount") as HTMLInputElement;
                          if (amountInput) {
                            amountInput.value = String(Number(service.price));
                          }
                        }
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhum serviço disponível
                          </div>
                        ) : (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(Number(service.price))}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      id="edit-category" 
                      name="category" 
                      required 
                      placeholder="Ex: Produtos, Aluguel, Salários..."
                      defaultValue={editingTransaction.category}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-description" className="mb-[3px]">Descrição *</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    required 
                    placeholder={transactionType === "income" ? "Descrição do serviço prestado" : "Descrição da despesa"}
                    defaultValue={editingTransaction.description}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-amount" className="mb-[3px]">Valor *</Label>
                  <Input 
                    id="edit-amount" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0.00"
                    defaultValue={editingTransaction.amount}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-paymentMethod" className="mb-[3px]">Método de Pagamento *</Label>
                  <Select name="paymentMethod" required defaultValue={editingTransaction.paymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setEditingTransaction(null);
                      setSelectedServiceId("");
                      setSelectedClientId("");
                      setTransactionType("income");
                      setSelectedDate(new Date());
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setTransactionToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (transactionToDelete) {
                  try {
                    // Buscar a transação antes de deletar para obter o client_id
                    const transactionToDeleteObj = transactions.find(t => t.id === transactionToDelete);
                    const clientIdToUpdate = transactionToDeleteObj?.clientId;

                    await deleteTransaction(transactionToDelete);
                    
                    // Atualizar total_spent do cliente se a transação era de receita com client_id
                    if (clientIdToUpdate && transactionToDeleteObj?.type === "income") {
                      await updateClientTotalSpent(clientIdToUpdate);
                    }

                    toast({
                      title: "Sucesso",
                      description: "Transação excluída com sucesso!",
                    });
                    setIsDeleteDialogOpen(false);
                    setTransactionToDelete(null);
                    loadTransactions();
                  } catch (error: any) {
                    toast({
                      title: "Erro",
                      description: error.message || "Erro ao excluir transação",
                      variant: "destructive",
                    });
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

