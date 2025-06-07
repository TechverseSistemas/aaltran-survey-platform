'use client';

import {
  Award,
  BarChart3,
  Building2,
  FileText,
  Home,
  Target,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarGroups = [
  {
    label: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: Home,
      },
    ],
  },
  {
    label: 'Módulo de Cadastro',
    items: [
      {
        title: 'Empresas',
        url: '/companies',
        icon: Building2,
      },
      {
        title: 'Funcionários',
        url: '/employees',
        icon: Users,
      },
      {
        title: 'Importar Excel',
        url: '/import',
        icon: Upload,
      },
    ],
  },
  {
    label: 'Módulo de Clima Organizacional',
    items: [
      {
        title: 'Questionários',
        url: '/questionarios',
        icon: FileText,
      },
      {
        title: 'Pesquisas Ativas',
        url: '/pesquisas',
        icon: BarChart3,
      },
      {
        title: 'Resultados',
        url: '/resultados',
        icon: TrendingUp,
      },
    ],
  },
  {
    label: 'Módulo de Avaliação',
    items: [
      {
        title: 'Avaliações 90°',
        url: '/avaliacao-90',
        icon: Target,
      },
      {
        title: 'Avaliações 180°',
        url: '/avaliacao-180',
        icon: Target,
      },
      {
        title: 'Avaliações 360°',
        url: '/avaliacao-360',
        icon: Target,
      },
      {
        title: 'Nine Box',
        url: '/nine-box',
        icon: Award,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b">
        <h1 className="font-semibold">AALTRAN</h1>
        <p className="text-muted-foreground text-xs">Sistema de Gestão</p>
      </SidebarHeader>

      <SidebarContent>
        {sidebarGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn({
                          'transition hover:translate-x-2': !isActive,
                          'bg-primary/10 hover:bg-primary/20 translate-x-2 rounded-md': isActive,
                        })}
                      >
                        <Link onClick={handleClick} href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
