"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime, formatPhone, formatCPF } from "@/lib/formatters";
import { storage } from "@/lib/storage";
import { mockServices } from "@/data";
import type { Client, Appointment } from "@/types";
import Link from "next/link";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const clients = storage.get<Client>("clients");
    const foundClient = clients.find((c) => c.id === params.id);
    setClient(foundClient || null);

    if (foundClient) {
      const allAppointments = storage.get<Appointment>("appointments");
      const clientAppointments = allAppointments
        .filter((apt) => apt.clientId === foundClient.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAppointments(clientAppointments);
    }
  }, [params.id]);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cliente não encontrado</p>
      </div>
    );
  }

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );
  const totalSpent = completedAppointments.reduce(
    (sum, apt) => sum + apt.totalAmount,
    0
  );
  const averageTicket =
    completedAppointments.length > 0
      ? totalSpent / completedAppointments.length
      : 0;

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      storage.delete<Client>("clients", client.id);
      router.push("/clientes");
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
              <p className="text-2xl font-bold">{client.totalVisits}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-bold">{formatCurrency(client.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="text-lg font-semibold">{formatCurrency(averageTicket)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Última Visita</p>
              <p className="text-sm font-medium">
                {client.lastVisit ? formatDate(typeof client.lastVisit === 'string' ? new Date(client.lastVisit) : client.lastVisit) : "Nunca"}
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
                <TableHead>Serviços</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço registrado.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => {
                  const services = appointment.serviceIds
                    .map((id) => mockServices.find((s) => s.id === id))
                    .filter(Boolean);
                  
                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {formatDateTime(typeof appointment.date === 'string' ? new Date(appointment.date) : appointment.date)}
                      </TableCell>
                      <TableCell>
                        {services.map((s) => s?.name).join(", ")}
                      </TableCell>
                      <TableCell>{formatCurrency(appointment.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : appointment.status === "no-show"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          }
                        >
                          {appointment.status === "completed"
                            ? "Concluído"
                            : appointment.status === "cancelled"
                            ? "Cancelado"
                            : appointment.status === "no-show"
                            ? "Falta"
                            : "Agendado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

