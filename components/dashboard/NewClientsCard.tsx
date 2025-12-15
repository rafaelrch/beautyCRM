import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserIcon } from "@heroicons/react/24/solid";
import type { Client } from "@/types";

interface NewClientsCardProps {
  clients?: Client[];
  periodDisplay?: string;
}

export function NewClientsCard({ clients = [], periodDisplay }: NewClientsCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Clientes novos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 pb-2 border-b">
            <div className="col-span-4">
              <span className="text-sm font-medium text-black">Nome</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-black">Telefone</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-black">Email</span>
            </div>
          </div>
          {/* Rows */}
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente novo no período</p>
          ) : (
            clients.map((client) => (
            <div key={client.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f1f0fb] flex items-center justify-center text-[#320fff]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground truncate">{client.name}</span>
              </div>
              <div className="col-span-4">
                <span className="text-sm text-muted-foreground">{client.phone}</span>
              </div>
              <div className="col-span-4">
                <span className="text-sm text-muted-foreground truncate block">{client.email}</span>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

