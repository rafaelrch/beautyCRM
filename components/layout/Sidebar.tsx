"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  UsersIcon,
  ScissorsIcon,
  BanknotesIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  Squares2X2Icon as Squares2X2IconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  UsersIcon as UsersIconSolid,
  ScissorsIcon as ScissorsIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  CubeIcon as CubeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from "@heroicons/react/24/solid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  iconSolid: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Squares2X2Icon,
    iconSolid: Squares2X2IconSolid,
  },
  {
    title: "Agendamentos",
    url: "/agendamentos",
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: UsersIcon,
    iconSolid: UsersIconSolid,
  },
  {
    title: "Profissionais",
    url: "/profissionais",
    icon: UserGroupIcon,
    iconSolid: UserGroupIconSolid,
  },
  {
    title: "Serviços",
    url: "/servicos",
    icon: ScissorsIcon,
    iconSolid: ScissorsIconSolid,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: BanknotesIcon,
    iconSolid: BanknotesIconSolid,
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: CubeIcon,
    iconSolid: CubeIconSolid,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [userData, setUserData] = useState<{
    salonName: string | null;
    email: string | null;
    fullName: string | null;
  }>({
    salonName: null,
    email: null,
    fullName: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Buscar dados do usuário na tabela users
          const { data, error } = await supabase
            .from("users")
            .select("salon_name, email, full_name")
            .eq("id", user.id)
            .single();

          if (error || !data) {
            console.error("Erro ao carregar dados do usuário:", error);
            // Usar dados do auth como fallback
            setUserData({
              salonName: user.user_metadata?.salon_name || null,
              email: user.email || null,
              fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
            });
          } else {
            const userRow = data as { salon_name?: string | null; email?: string | null; full_name?: string | null };
            setUserData({
              salonName: userRow.salon_name || null,
              email: userRow.email || user.email || null,
              fullName: userRow.full_name || null,
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
      }
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      router.push("/login");
    }
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="justify-start">
                <div className="flex items-center justify-start rounded-lg overflow-hidden">
                  <Image
                    src={isCollapsed ? "/icon-1.png" : "/logo.png"}
                    alt="Logo"
                    width={isCollapsed ? 40 : 180}
                    height={isCollapsed ? 40 : 180}
                    className="object-contain"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                const Icon = isActive ? item.iconSolid : item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "[&>svg]:text-primary" : ""}
                    >
                      <Link href={item.url}>
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  size="lg" 
                  tooltip={userData.salonName || userData.fullName || "Usuário"} 
                  className="w-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(userData.salonName || userData.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userData.salonName || userData.fullName || "Usuário"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userData.email || "email@exemplo.com"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
