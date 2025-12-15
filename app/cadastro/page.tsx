"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function CadastroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    salonName: "",
    email: "",
    cnpj: "",
    phone: "",
    address: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            salon_name: formData.salonName,
            cnpj: formData.cnpj,
            phone: formData.phone,
            address: formData.address,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // Verificar se o email precisa ser confirmado
      if (authData.user && !authData.session) {
        // Email precisa ser confirmado
        toast({
          title: "Conta criada com sucesso!",
          description: "Por favor, verifique seu email e confirme sua conta antes de fazer login.",
          duration: 10000,
        });
        
        // Limpar o formulário
        setFormData({
          firstName: "",
          lastName: "",
          salonName: "",
          email: "",
          cnpj: "",
          phone: "",
          address: "",
          password: "",
        });
        
        setIsLoading(false);
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        
        return;
      }

      // Se já estiver autenticado (email confirmado), atualizar dados na tabela users
      if (authData.session) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: fullName,
            salon_name: formData.salonName,
            cnpj: formData.cnpj,
            phone: formData.phone,
            address: formData.address,
          } as any)
          .eq("id", authData.user.id);

        if (updateError) {
          console.error("Erro ao atualizar dados do usuário:", updateError);
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Redirecionando para o dashboard...",
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    }
    return value;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden m-4 rounded-4xl">
        <Image
          src="/salao-2.jpg"
          alt="Salão de beleza"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Criar sua conta
            </h1>
            <p className="text-muted-foreground">
              Olá! Vamos criar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nome"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Sobrenome"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Salon Name */}
            <div className="space-y-2">
              <Label htmlFor="salonName">Nome do Salão</Label>
              <Input
                id="salonName"
                type="text"
                placeholder="Nome do salão"
                value={formData.salonName}
                onChange={(e) =>
                  setFormData({ ...formData, salonName: e.target.value })
                }
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Endereço de email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cnpj: formatCNPJ(e.target.value),
                  })
                }
                maxLength={18}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex gap-2">
                <div className="w-20 flex items-center justify-center border border-input rounded-md bg-muted/50">
                  <span className="text-sm text-muted-foreground">+55</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: formatPhone(e.target.value),
                    })
                  }
                  className="flex-1"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                type="text"
                placeholder="Endereço completo"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar minha conta"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Já tem uma conta?{" "}
              </span>
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Entrar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}






