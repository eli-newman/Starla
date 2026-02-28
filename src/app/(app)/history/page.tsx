export const dynamic = 'force-dynamic';

import { SessionList } from '@/components/session-list';

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-light">Session History</h1>
        <p className="text-neutral-500">Review your past interview practice sessions.</p>
      </div>
      <SessionList />
    </div>
  );
}
