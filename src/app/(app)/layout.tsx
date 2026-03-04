import { Providers } from '@/components/providers';
import { AppShell } from '@/components/app-shell';
import { ToastProvider } from '@/components/toast';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ToastProvider>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </Providers>
  );
}
