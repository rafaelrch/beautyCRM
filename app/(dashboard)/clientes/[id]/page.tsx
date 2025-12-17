"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime, formatPhone, formatCPF } from "@/lib/formatters";
import { getClients, getAppointments, deleteClient, getServices, getTransactions } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import type { Client, Appointment } from "@/types";
import type { Database } from "@/types/database";
import Link from "next/link";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

interface ServiceHistory {
  id: string;
  date: Date;
  serviceName: string;
  amount: number;
  status: string;
}

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClientData();
  }, [params.id]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      const [clientsData, appointmentsData, servicesData, transactionsData] = await Promise.all([
        getClients(),
        getAppointments(),
        getServices(),
        getTransactions(),
      ]);

      // Encontrar o cliente
      const foundClient = clientsData.find((c: ClientRow) => c.id === params.id);
      if (!foundClient) {
        setClient(null);
        setIsLoading(false);
        return;
      }

      // Converter cliente do Supabase para o formato esperado
      const formattedClient: Client = {
        id: foundClient.id,
        name: foundClient.name,
        phone: foundClient.phone || "",
        email: foundClient.email || "",
        birthdate: foundClient.birthdate ? new Date(foundClient.birthdate) : new Date(),
        address: foundClient.address || "",
        cpf: foundClient.cpf || "",
        registrationDate: new Date(foundClient.registration_date),
        lastVisit: foundClient.last_visit ? new Date(foundClient.last_visit) : null,
        totalSpent: Number(foundClient.total_spent) || 0,
        totalVisits: Number(foundClient.total_visits) || 0,
        notes: foundClient.notes || "",
        status: foundClient.status || "active",
      };
      setClient(formattedClient);

      // Salvar serviços para usar na renderização
      setServices(servicesData);

      // Converter agendamentos do Supabase
      const clientAppointments: Appointment[] = appointmentsData
        .filter((apt: AppointmentRow) => apt.client_id === foundClient.id)
        .map((apt: AppointmentRow) => {
          // Converter data (sempre string do banco)
          let appointmentDate: Date;
          const dateValue = apt.date as string;
          if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateValue.split('-').map(Number);
            appointmentDate = new Date(year, month - 1, day);
          } else {
            appointmentDate = new Date(dateValue);
          }

          // Calcular totalAmount dos serviços
          const appointmentServices = (apt.service_ids || [])
            .map((id: string) => servicesData.find((s: ServiceRow) => s.id === id))
            .filter(Boolean) as ServiceRow[];
          const totalAmount = appointmentServices.reduce((sum: number, s: ServiceRow) => sum + Number(s.price || 0), 0);

          return {
            id: apt.id,
            clientId: apt.client_id,
            serviceIds: apt.service_ids || [],
            professionalId: apt.professional_id,
            date: appointmentDate,
            startTime: apt.start_time,
            endTime: apt.end_time,
            status: apt.status || 'scheduled',
            totalAmount: totalAmount,
            notes: apt.notes || "",
          } as Appointment;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAppointments(clientAppointments);

      // Buscar histórico de serviços a partir das transações de receita do cliente
      const clientTransactions: ServiceHistory[] = transactionsData
        .filter((t: TransactionRow) => 
          t.client_id === foundClient.id && 
          t.type === "income" && 
          t.status === "completed"
        )
        .map((t: TransactionRow) => {
          // Converter data
          let transactionDate: Date;
          const dateValue = t.date as string;
          if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateValue.split('-').map(Number);
            transactionDate = new Date(year, month - 1, day);
          } else {
            transactionDate = new Date(dateValue);
          }

          // Extrair nome do serviço da categoria ou descrição
          let serviceName = t.description || t.category || "Serviço";
          if (t.category && t.category.startsWith("Serviços - ")) {
            serviceName = t.category.replace("Serviços - ", "");
          } else if (t.category && t.category.startsWith("Venda de Produto - ")) {
            serviceName = t.category.replace("Venda de Produto - ", "");
          }

          return {
            id: t.id,
            date: transactionDate,
            serviceName: serviceName,
            amount: Number(t.amount) || 0,
            status: "completed",
          };
        })
        .sort((a: ServiceHistory, b: ServiceHistory) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setServiceHistory(clientTransactions);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar dados do cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cliente não encontrado</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!client) return;
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      await deleteClient(client.id);
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
      router.push("/clientes");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {client.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Detalhes do cliente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="text-sm font-medium">{formatPhone(client.phone)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPF</p>
              <p className="text-sm font-medium">{formatCPF(client.cpf)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data de Nascimento</p>
              <p className="text-sm font-medium">
                {formatDate(client.birthdate ? (typeof client.birthdate === 'string' ? new Date(client.birthdate) : client.birthdate) : null)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="text-sm font-medium">{client.address}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Total de Visitas</p>
              <p className="text-2xl font-bold">{serviceHistory.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-bold">{formatCurrency(client.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última Visita</p>
              <p className="text-sm font-medium">
                {serviceHistory.length > 0 ? formatDate(serviceHistory[0].date) : "Nunca"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cadastro</p>
              <p className="text-sm font-medium">
                {formatDate(client.registrationDate ? (typeof client.registrationDate === 'string' ? new Date(client.registrationDate) : client.registrationDate) : null)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {client.notes || "Nenhuma observação registrada."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço registrado.
                  </TableCell>
                </TableRow>
              ) : (
                serviceHistory.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {formatDate(service.date)}
                    </TableCell>
                    <TableCell>
                      {service.serviceName}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(service.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        Concluído
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

