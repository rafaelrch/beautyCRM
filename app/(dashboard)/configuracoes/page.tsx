 "use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUserProfile } from "@/lib/supabase-helpers";

type UserProfile = {
  id: string;
  full_name: string | null;
  salon_name: string | null;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUserProfile();
        setProfile(data as UserProfile);
      } catch (err: any) {
        setError(err?.message || "Não foi possível carregar os dados do salão.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações do seu salão</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Carregando informações do salão...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configurações do seu salão</p>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-red-500">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salon_name">Nome do Salão</Label>
              <Input id="salon_name" value={profile.salon_name || ""} readOnly />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={profile.phone || ""} readOnly />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email || ""} readOnly />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={profile.cnpj || ""} readOnly />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={profile.address || ""} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

