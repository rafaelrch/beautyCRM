"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserConfig {
  id: string;
  email: string;
  full_name: string;
  salon_name: string;
  cnpj: string;
  phone: string;
  address: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<UserConfig | null>(null);
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
        .from("users") as any)
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const userData = data as {
          id: string;
          email: string | null;
          full_name: string | null;
          salon_name: string | null;
          cnpj: string | null;
          phone: string | null;
          address: string | null;
        };
        setConfig({
          id: userData.id,
          email: userData.email || "",
          full_name: userData.full_name || "",
          salon_name: userData.salon_name || "",
          cnpj: userData.cnpj || "",
          phone: userData.phone || "",
          address: userData.address || "",
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
        salon_name: formData.get("salon_name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
        cnpj: formData.get("cnpj") as string,
        full_name: formData.get("full_name") as string,
      };

      const { error } = await (supabase
        .from("users") as any)
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

      <Card>
        <CardHeader>
          <CardTitle>Informações do Salão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSalonInfo} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salon_name">Nome do Salão *</Label>
                <Input 
                  id="salon_name" 
                  name="salon_name" 
                  required 
                  defaultValue={config.salon_name} 
                  placeholder="Nome do seu salão"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Nome do Proprietário *</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  required 
                  defaultValue={config.full_name} 
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  required 
                  defaultValue={config.phone} 
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  defaultValue={config.email} 
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input 
                  id="cnpj" 
                  name="cnpj" 
                  required 
                  defaultValue={config.cnpj} 
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço *</Label>
                <Input 
                  id="address" 
                  name="address" 
                  required 
                  defaultValue={config.address} 
                  placeholder="Endereço completo"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
