"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCNPJ, formatPhone } from "@/lib/formatters";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/database";

type SalonConfigRow = Database["public"]["Tables"]["salon_config"]["Row"];

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface SalonConfig {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cnpj: string;
  businessHours: BusinessHours;
}

const defaultBusinessHours: BusinessHours = {
  monday: { open: "09:00", close: "18:00", closed: false },
  tuesday: { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday: { open: "09:00", close: "18:00", closed: false },
  friday: { open: "09:00", close: "18:00", closed: false },
  saturday: { open: "09:00", close: "13:00", closed: false },
  sunday: { open: "09:00", close: "18:00", closed: true },
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase
        .from("salon_config") as any)
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          cnpj: data.cnpj || "",
          businessHours: (data.business_hours as BusinessHours) || defaultBusinessHours,
        });
      } else {
        // Criar configuração padrão
        const { data: newConfig, error: createError } = await (supabase
          .from("salon_config") as any)
          .insert({
            user_id: user.id,
            name: "Meu Salão",
            business_hours: defaultBusinessHours,
          })
          .select()
          .single();

        if (createError) throw createError;

        setConfig({
          id: newConfig.id,
          name: newConfig.name || "",
          phone: newConfig.phone || "",
          email: newConfig.email || "",
          address: newConfig.address || "",
          cnpj: newConfig.cnpj || "",
          businessHours: (newConfig.business_hours as BusinessHours) || defaultBusinessHours,
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSalonInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!config) return;

    try {
      setIsSaving(true);
      const formData = new FormData(e.currentTarget);
      
      const updatedData = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
        cnpj: formData.get("cnpj") as string,
      };

      const { error } = await (supabase
        .from("salon_config") as any)
        .update(updatedData)
        .eq("id", config.id);

      if (error) throw error;

      setConfig({ ...config, ...updatedData });
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDayHours = async (day: string, field: string, value: any) => {
    if (!config) return;
    
    const updatedHours = {
      ...config.businessHours,
      [day]: {
        ...config.businessHours[day as keyof BusinessHours],
        [field]: value,
      },
    };

    try {
      const { error } = await (supabase
        .from("salon_config") as any)
        .update({ business_hours: updatedHours })
        .eq("id", config.id);

      if (error) throw error;

      setConfig({ ...config, businessHours: updatedHours });
    } catch (error: any) {
      console.error("Erro ao atualizar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os horários",
        variant: "destructive",
      });
    }
  };

  const applyToWeekdays = async () => {
    if (!config) return;
    
    const mondayHours = config.businessHours.monday;
    const updatedHours = {
      ...config.businessHours,
      tuesday: mondayHours,
      wednesday: mondayHours,
      thursday: mondayHours,
      friday: mondayHours,
    };

    try {
      const { error } = await (supabase
        .from("salon_config") as any)
        .update({ business_hours: updatedHours })
        .eq("id", config.id);

      if (error) throw error;

      setConfig({ ...config, businessHours: updatedHours });
      
      toast({
        title: "Sucesso",
        description: "Horários aplicados aos dias úteis",
      });
    } catch (error: any) {
      console.error("Erro ao aplicar horários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar os horários",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Não foi possível carregar as configurações</p>
      </div>
    );
  }

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
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
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
