import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="w-full max-w-md">{children}</div>

      <div className="text-muted-foreground mt-8 text-center text-sm">
        © {new Date().getFullYear()} AALTRAN. Todos os direitos reservados.
      </div>
    </div>
  );
}
