import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { resolveColdStartRoute, type ColdStartRoute } from '@/features/auth/resolve-cold-start-route';
import WelcomeRoute from './(auth)/welcome';

export default function IndexRoute() {
  const [target, setTarget] = useState<ColdStartRoute | 'checking'>('checking');

  useEffect(() => {
    let cancelled = false;
    resolveColdStartRoute().then((route) => {
      if (!cancelled) setTarget(route);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (target === 'checking') return null;
  if (target === '/learn') return <Redirect href="/learn" />;
  return <WelcomeRoute />;
}
