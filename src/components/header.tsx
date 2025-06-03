'use client';
import { Company } from '@/lib/types/companies.type';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SidebarTrigger } from './ui/sidebar';
export default function Header() {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const { data } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutes // 1 hour
  });
  async function fetchCompanies() {
    const req = await fetch('/api/companies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const companies: Company[] = await req.json();
    return companies;
  }
  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b p-4">
      <SidebarTrigger variant={'ghost'} size={'icon'} />
      <div className="flex items-center gap-2">
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            {data?.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.fantasy_name}>
                {empresa.fantasy_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />

              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer text-red-500 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />

              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
