"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { Database } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // O Supabase Auth aceita apenas email, não telefone
      const email = formData.emailOrPhone.trim();
      
      if (!email.includes("@")) {
        toast({
          title: "Erro",
          description: "Por favor, use seu email para fazer login",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        // Verificar se a sessão foi salva corretamente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          // Atualizar dados do usuário na tabela users com os dados do metadata
          // Isso garante que os dados estejam sincronizados após confirmação de email
          const userMetadata = data.user.user_metadata || {};
          const userUpdateData: Partial<Database["public"]["Tables"]["users"]["Update"]> = {};
          
          if (userMetadata.full_name || userMetadata.name) {
            userUpdateData.full_name = userMetadata.full_name || userMetadata.name;
          }
          if (userMetadata.salon_name) {
            userUpdateData.salon_name = userMetadata.salon_name;
          }
          if (userMetadata.cnpj) {
            userUpdateData.cnpj = userMetadata.cnpj;
          }
          if (userMetadata.phone) {
            userUpdateData.phone = userMetadata.phone;
          }
          if (userMetadata.address) {
            userUpdateData.address = userMetadata.address;
          }
          
          if (Object.keys(userUpdateData).length > 0) {
            const { error: updateError } = await supabase
              .from("users")
              // @ts-ignore Supabase client sem tipos gerados
              .update(userUpdateData)
              .eq("id", data.user.id);

            if (updateError) {
              console.error("Erro ao atualizar dados do usuário:", updateError);
              // Não vamos falhar o login se isso der erro
            }
          }
          
          toast({
            title: "Sucesso",
            description: "Login realizado com sucesso!",
          });
          
          // Aguardar um pouco para garantir que os cookies sejam salvos
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirecionar para o dashboard
          window.location.href = "/dashboard";
        } else {
          throw new Error("Erro ao salvar sessão. Tente novamente.");
        }
      } else {
        throw new Error("Erro ao fazer login. Tente novamente.");
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Verifique seu email e senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={180}
              height={180}
              className="object-contain"
              priority
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Phone */}
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">Email</Label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Digite seu email"
                value={formData.emailOrPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emailOrPhone: e.target.value })
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
                  placeholder="Digite sua senha"
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

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Não tem uma conta?{" "}
              </span>
              <Link
                href="/cadastro"
                className="text-[#6B46C1] font-semibold hover:underline"
              >
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden m-4 rounded-4xl">
        <Image
          src="/salao-1.jpg"
          alt="Salão de beleza"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

