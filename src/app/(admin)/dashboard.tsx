import { useRouter } from 'expo-router';

import { AdminDashboardScreen } from '@/features/admin/admin-dashboard-screen';

export default function AdminDashboardRoute() {
  const router = useRouter();
  return <AdminDashboardScreen onBack={() => router.back()} />;
}
