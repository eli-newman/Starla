export const dynamic = 'force-dynamic';

import { Providers } from '@/components/providers';
import { LoginPage } from '@/components/login-page';

export default function Page() {
  return (
    <Providers>
      <LoginPage />
    </Providers>
  );
}
