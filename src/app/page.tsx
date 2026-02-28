import { redirect } from 'next/navigation';

export default function Home() {
  // Root page redirects to interview (auth guard in app layout will redirect to login if needed)
  redirect('/interview');
}
