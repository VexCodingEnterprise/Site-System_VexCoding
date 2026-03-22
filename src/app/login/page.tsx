import { LoginView } from '@/components/login-view';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  return <LoginView redirectTo={searchParams?.redirect || '/dashboard'} />;
}
