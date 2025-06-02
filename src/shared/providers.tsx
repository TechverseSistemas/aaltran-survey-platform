import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
