"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthdate: Date;
  address: string;
  cpf: string;
  registrationDate: Date;
  lastVisit: Date | null;
  totalSpent: number;
  totalVisits: number;
  notes: string;
  status: "active" | "inactive";
}

interface NewClientsCardProps {
  clients: Client[];
  periodDisplay?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function NewClientsCard({ clients, periodDisplay }: NewClientsCardProps) {
  // Ordenar por data de registro mais recente
  const sortedClients = [...clients].sort(
    (a, b) => b.registrationDate.getTime() - a.registrationDate.getTime()
  );

  // Mostrar apenas os 10 mais recentes
  const displayClients = sortedClients.slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold tracking-tighter">Novos Clientes</CardTitle>
          <Badge className="bg-blue-500/10 text-blue-600 border-0 font-bold">
            {clients.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {displayClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum cliente novo no período
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Cabeçalho */}
            <div className="grid grid-cols-[2fr_1fr_1.5fr] gap-4 pb-2 mb-2 border-b text-sm font-medium text-muted-foreground">
              <div>Nome</div>
              <div>Telefone</div>
              <div>Email</div>
            </div>
            {/* Lista de clientes */}
            <ScrollArea className="h-[200px]">
              <div className="space-y-0">
                {displayClients.map((client, index) => (
                  <div
                    key={client.id}
                    className={`grid grid-cols-[2fr_1fr_1.5fr] gap-4 py-3 ${
                      index !== displayClients.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{client.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {client.phone || "-"}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {client.email || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
