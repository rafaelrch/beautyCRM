"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Search, Filter, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, formatPhone, formatCPF } from "@/lib/formatters";
import { getClients, createClient, updateClient, deleteClient, getTransactions, getAppointments } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@/types";
import type { Database } from "@/types/database";
import Link from "next/link";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const [clientsData, transactionsData, appointmentsData] = await Promise.all([
        getClients(),
        getTransactions(),
        getAppointments(),
      ]);

      // Calcular total gasto por cliente a partir das transações
      const clientTotals = new Map<string, number>();
      
      transactionsData.forEach((transaction: TransactionRow) => {
        // Só considerar transações do tipo "income" (receitas) e que tenham client_id
        if (transaction.type === "income" && transaction.client_id && transaction.status === "completed") {
          const clientId = transaction.client_id;
          const amount = Number(transaction.amount) || 0;
          const currentTotal = clientTotals.get(clientId) || 0;
          clientTotals.set(clientId, currentTotal + amount);
        }
      });

      // Calcular last_visit e total_visits a partir dos agendamentos concluídos
      const clientLastVisits = new Map<string, Date>();
      const clientVisitCounts = new Map<string, number>();

      appointmentsData.forEach((appointment: AppointmentRow) => {
        // Só considerar agendamentos concluídos
        const status = String(appointment.status || "").toLowerCase();
        if ((status === "concluido" || status === "completed") && appointment.client_id) {
          const clientId = appointment.client_id;
          
          // Converter data do agendamento para Date
          let appointmentDate: Date;
          if (typeof appointment.date === "string") {
            if (appointment.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = appointment.date.split("-").map(Number);
              appointmentDate = new Date(year, month - 1, day);
            } else {
              appointmentDate = new Date(appointment.date);
            }
          } else {
            appointmentDate = new Date(appointment.date as any);
          }

          // Atualizar última visita se for mais recente
          const currentLastVisit = clientLastVisits.get(clientId);
          if (!currentLastVisit || appointmentDate > currentLastVisit) {
            clientLastVisits.set(clientId, appointmentDate);
          }

          // Contar visitas
          const currentCount = clientVisitCounts.get(clientId) || 0;
          clientVisitCounts.set(clientId, currentCount + 1);
        }
      });

      // Atualizar clientes no banco de dados com last_visit e total_visits
      const updatePromises: Promise<any>[] = [];
      
      clientsData.forEach((client: any) => {
        const lastVisit = clientLastVisits.get(client.id);
        const totalVisits = clientVisitCounts.get(client.id) || 0;
        
        // Converter last_visit atual do banco para comparar
        let currentLastVisit: Date | null = null;
        if (client.last_visit) {
          if (typeof client.last_visit === 'string') {
            if (client.last_visit.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = client.last_visit.split('-').map(Number);
              currentLastVisit = new Date(year, month - 1, day);
            } else {
              currentLastVisit = new Date(client.last_visit);
            }
          } else {
            currentLastVisit = new Date(client.last_visit);
          }
        }

        // Comparar apenas a data (sem hora) para verificar se precisa atualizar
        const lastVisitDateStr = lastVisit ? lastVisit.toISOString().split('T')[0] : null;
        const currentLastVisitDateStr = currentLastVisit ? currentLastVisit.toISOString().split('T')[0] : null;
        const currentTotalVisits = Number(client.total_visits || 0);

        // Só atualizar se houver mudanças
        const needsUpdate = 
          lastVisitDateStr !== currentLastVisitDateStr ||
          currentTotalVisits !== totalVisits;

        if (needsUpdate && lastVisit) {
          updatePromises.push(
            updateClient(client.id, {
              last_visit: lastVisitDateStr,
              total_visits: totalVisits,
            }).catch((error) => {
              console.error(`Erro ao atualizar cliente ${client.id}:`, error);
            })
          );
        }
      });

      // Executar atualizações em paralelo (sem bloquear a UI)
      if (updatePromises.length > 0) {
        Promise.all(updatePromises).catch((error) => {
          console.error("Erro ao atualizar alguns clientes:", error);
        });
      }

      // Converter dados do Supabase para o formato esperado
      const formattedClients: Client[] = clientsData.map((client: any) => {
        // Usar o total_spent do banco de dados (já atualizado quando transações são criadas/editadas/deletadas)
        // Se não houver no banco, calcular a partir das transações como fallback
        const totalSpent = Number(client.total_spent) || clientTotals.get(client.id) || 0;
        
        // Usar os valores calculados dos agendamentos (ou os do banco se não houver agendamentos)
        const lastVisit = clientLastVisits.get(client.id) || (client.last_visit ? new Date(client.last_visit) : null);
        const totalVisits = clientVisitCounts.get(client.id) || Number(client.total_visits || 0);

        return {
          id: client.id,
          name: client.name,
          phone: client.phone || "",
          email: client.email || "",
          birthdate: client.birthdate ? new Date(client.birthdate) : new Date(),
          address: client.address || "",
          cpf: client.cpf || "",
          registrationDate: client.registration_date ? new Date(client.registration_date) : new Date(),
          lastVisit: lastVisit,
          totalSpent: totalSpent,
          totalVisits: totalVisits,
          notes: client.notes || "",
          status: client.status || "active",
        } as Client;
      });
      setClients(formattedClients);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
    setBirthdate(undefined);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setBirthdate(undefined);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setBirthdate(client.birthdate ? new Date(client.birthdate) : undefined);
    setIsDialogOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      await deleteClient(id);
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
      loadClients();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir cliente",
        variant: "destructive",
      });
    }
  };

  const handleSaveClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const birthdateValue = formData.get("birthdate") as string;
    
    try {
      if (editingClient) {
        await updateClient(editingClient.id, {
          name: formData.get("name") as string,
          phone: formData.get("phone") as string,
          email: formData.get("email") as string || null,
          birthdate: birthdateValue ? birthdateValue : null,
          address: formData.get("address") as string || null,
          cpf: formData.get("cpf") as string || null,
          notes: formData.get("notes") as string || null,
          status: (formData.get("status") as "active" | "inactive") || "active",
        });
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso!",
        });
      } else {
        await createClient({
          name: formData.get("name") as string,
          phone: formData.get("phone") as string,
          email: formData.get("email") as string || null,
          birthdate: birthdateValue || null,
          address: formData.get("address") as string || null,
          cpf: formData.get("cpf") as string || null,
          notes: formData.get("notes") as string || null,
          status: (formData.get("status") as "active" | "inactive") || "active",
        } as any);
        toast({
          title: "Sucesso",
          description: "Cliente criado com sucesso!",
        });
      }

      handleCloseDialog();
      loadClients();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Clientes" actionLabel="Adicionar Cliente" onAction={handleAddClient} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-xl border border-border p-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, telefone ou email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex sm:flex-none justify-end sm:justify-start">
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Última Visita</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado. Adicione o primeiro cliente.
                  </TableCell>
                </TableRow>
              ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{formatPhone(client.phone)}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {client.lastVisit ? formatDate(client.lastVisit) : "Nunca"}
                  </TableCell>
                  <TableCell>{formatCurrency(client.totalSpent)}</TableCell>
                  <TableCell>{client.totalVisits}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        client.status === "active"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {client.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/clientes/${client.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClient(client.id)}
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
          </div>
        )}
      </div>

      {/* Client Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        } else {
          setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Adicionar Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-[3px]">Nome *</Label>
                <Input id="name" name="name" required defaultValue={editingClient?.name} />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-[3px]">Telefone *</Label>
                <Input id="phone" name="phone" required defaultValue={editingClient?.phone} />
              </div>
              <div>
                <Label htmlFor="email" className="mb-[3px]">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingClient?.email} />
              </div>
              <div>
                <Label htmlFor="cpf" className="mb-[3px]">CPF</Label>
                <Input id="cpf" name="cpf" defaultValue={editingClient?.cpf} />
              </div>
              <div>
                <Label htmlFor="birthdate" className="mb-[3px]">Data de Nascimento</Label>
                <DatePicker
                  id="birthdate"
                  value={birthdate}
                  onChange={(dateString) => {
                    const newDate = dateString ? new Date(dateString) : undefined;
                    setBirthdate(newDate);
                    const hiddenInput = document.getElementById("birthdate-hidden") as HTMLInputElement;
                    if (hiddenInput) {
                      hiddenInput.value = dateString || "";
                    }
                  }}
                  placeholder="Selecione a data de nascimento"
                />
                <input
                  type="hidden"
                  id="birthdate-hidden"
                  name="birthdate"
                  value={
                    birthdate
                      ? birthdate.toISOString().split("T")[0]
                      : ""
                  }
                />
              </div>
              <div>
                <Label htmlFor="status" className="mb-[3px]">Status</Label>
                <Select
                  name="status"
                  defaultValue={editingClient?.status || "active"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="mb-[3px]">Endereço</Label>
                <Input id="address" name="address" defaultValue={editingClient?.address} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes" className="mb-[3px]">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={editingClient?.notes}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
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

