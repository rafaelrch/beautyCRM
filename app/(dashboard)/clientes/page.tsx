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
import { Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, formatPhone, formatCPF } from "@/lib/formatters";
import { storage, initializeStorage } from "@/lib/storage";
import { mockClients, mockServices, mockTransactions, mockAppointments, mockProducts, mockMovements, mockSalonConfig } from "@/data";
import type { Client } from "@/types";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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
    setClients(storage.get<Client>("clients"));
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      storage.delete<Client>("clients", id);
      setClients(storage.get<Client>("clients"));
    }
  };

  const handleSaveClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const clientData = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      birthdate: new Date(formData.get("birthdate") as string),
      address: formData.get("address") as string,
      cpf: formData.get("cpf") as string,
      notes: formData.get("notes") as string,
      status: (formData.get("status") as "active" | "inactive") || "active",
    };

    if (editingClient) {
      storage.update<Client>("clients", editingClient.id, {
        ...clientData,
        registrationDate: editingClient.registrationDate,
        lastVisit: editingClient.lastVisit,
        totalSpent: editingClient.totalSpent,
        totalVisits: editingClient.totalVisits,
      });
    } else {
      storage.add<Client>("clients", {
        ...clientData,
        id: "",
        registrationDate: new Date(),
        lastVisit: null,
        totalSpent: 0,
        totalVisits: 0,
      });
    }

    setClients(storage.get<Client>("clients"));
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      <Header title="Clientes" actionLabel="Adicionar Cliente" onAction={handleAddClient} />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-4">
        <div className="relative flex-1">
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
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-border p-6">
        <Table>
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

      {/* Client Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editar Cliente" : "Adicionar Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  value={
                    editingClient?.birthdate
                      ? new Date(editingClient.birthdate)
                      : undefined
                  }
                  onChange={(date) => {
                    const hiddenInput = document.getElementById("birthdate-hidden") as HTMLInputElement;
                    if (hiddenInput) {
                      hiddenInput.value = date;
                    }
                  }}
                  placeholder="Selecione a data de nascimento"
                />
                <input
                  type="hidden"
                  id="birthdate-hidden"
                  name="birthdate"
                  value={
                    editingClient?.birthdate
                      ? new Date(editingClient.birthdate).toISOString().split("T")[0]
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
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
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

