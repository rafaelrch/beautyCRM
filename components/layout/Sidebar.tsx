"use client";

import Link from "next/link";
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
    title: "Relatórios",
    url: "/relatorios",
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid,
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-semibold">B</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BeautyDesk</span>
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
            <SidebarMenuButton size="lg" tooltip="John Doe">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">John Doe</span>
                <span className="truncate text-xs text-muted-foreground">john@example.com</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
