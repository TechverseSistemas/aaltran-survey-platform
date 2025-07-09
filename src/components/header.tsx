'use client';

import { LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidebarTrigger } from './ui/sidebar';
import SelectCompany from './select-company';
import { useRouter } from 'next/navigation';
import { useAuthContext } from "@/context/authContext";

export default function Header() {
  const router = useRouter();
  const { logout } = useAuthContext();

  async function handleLogout() {
    await logout();
    router.replace('login');
  }

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b p-4">
      <div className="container flex items-center justify-between">
        <SidebarTrigger variant={'ghost'} size={'icon'} />

        <div className="flex items-center gap-2">
          <SelectCompany />

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer" asChild>
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

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />

                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
