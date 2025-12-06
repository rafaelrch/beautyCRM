"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCNPJ, formatPhone } from "@/lib/formatters";
import { storage, initializeStorage } from "@/lib/storage";
import { mockClients, mockServices, mockTransactions, mockAppointments, mockProducts, mockMovements, mockSalonConfig } from "@/data";
import type { SalonConfig } from "@/types";

const days = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
] as const;

export default function SettingsPage() {
  const [config, setConfig] = useState<SalonConfig | null>(null);

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
    const configs = storage.get<SalonConfig>("salonConfig");
    setConfig(configs[0] || null);
  }, []);

  if (!config) return null;

  const handleSaveSalonInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    storage.update<SalonConfig>("salonConfig", config.id, {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      cnpj: formData.get("cnpj") as string,
    });
    const configs = storage.get<SalonConfig>("salonConfig");
    setConfig(configs[0]);
  };

  const handleUpdateDayHours = (day: string, field: string, value: any) => {
    if (!config) return;
    const updated = {
      ...config,
      businessHours: {
        ...config.businessHours,
        [day]: {
          ...config.businessHours[day as keyof typeof config.businessHours],
          [field]: value,
        },
      },
    };
    storage.update<SalonConfig>("salonConfig", config.id, updated);
    setConfig(updated);
  };

  const applyToWeekdays = () => {
    if (!config) return;
    const mondayHours = config.businessHours.monday;
    const updated = {
      ...config,
      businessHours: {
        ...config.businessHours,
        tuesday: mondayHours,
        wednesday: mondayHours,
        thursday: mondayHours,
        friday: mondayHours,
      },
    };
    storage.update<SalonConfig>("salonConfig", config.id, updated);
    setConfig(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do seu salão</p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Informações do Salão</TabsTrigger>
          <TabsTrigger value="hours">Horário de Funcionamento</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Salão</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSalonInfo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Salão *</Label>
                    <Input id="name" name="name" required defaultValue={config.name} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" name="phone" required defaultValue={config.phone} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required defaultValue={config.email} />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input id="cnpj" name="cnpj" required defaultValue={config.cnpj} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input id="address" name="address" required defaultValue={config.address} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Horário de Funcionamento</CardTitle>
                <Button variant="outline" onClick={applyToWeekdays}>
                  Aplicar aos dias úteis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {days.map((day) => {
                  const dayHours = config.businessHours[day.key];
                  return (
                    <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-32">
                        <p className="font-medium">{day.label}</p>
                      </div>
                      <Switch
                        checked={!dayHours.closed}
                        onCheckedChange={(checked) =>
                          handleUpdateDayHours(day.key, "closed", !checked)
                        }
                      />
                      {!dayHours.closed && (
                        <>
                          <div className="flex-1">
                            <Label>Abertura</Label>
                            <Input
                              type="time"
                              value={dayHours.open}
                              onChange={(e) => handleUpdateDayHours(day.key, "open", e.target.value)}
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Fechamento</Label>
                            <Input
                              type="time"
                              value={dayHours.close}
                              onChange={(e) => handleUpdateDayHours(day.key, "close", e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      {dayHours.closed && (
                        <p className="text-muted-foreground">Fechado</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

