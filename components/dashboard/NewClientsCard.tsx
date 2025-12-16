"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Phone, Mail } from "lucide-react";

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
          <CardTitle className="text-lg font-semibold">Novos Clientes</CardTitle>
          <Badge variant="secondary" className="font-normal">
            {clients.length} no período
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
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {displayClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {format(client.registrationDate, "dd/MM/yy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
