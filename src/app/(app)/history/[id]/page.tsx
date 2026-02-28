export const dynamic = 'force-dynamic';

import { SessionDetail } from '@/components/session-detail';

export default function SessionPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12">
      <SessionDetail sessionId={params.id} />
    </div>
  );
}
