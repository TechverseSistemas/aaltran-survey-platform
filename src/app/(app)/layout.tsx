import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <Header />

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
