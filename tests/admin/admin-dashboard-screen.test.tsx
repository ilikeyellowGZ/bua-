import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { AdminDashboardScreen } from '@/features/admin/admin-dashboard-screen';
import { MotionProvider } from '@/core/motion/motion-provider';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

const snapshot = {
  totalUsers: 42,
  activeUsers7d: 10,
  lessonCompletionsToday: 5,
  pendingSyncOperations: 0,
  failedSyncOperations: 0,
  oldestPendingSyncSeconds: null,
  errorEvents24h: 0,
  averageStreakDays: 3.2,
};

describe('AdminDashboardScreen', () => {
  it('shows a denied panel for a non-admin account without loading the snapshot', async () => {
    const getDashboardSnapshot = jest.fn();
    const loadRepository = jest.fn().mockResolvedValue({
      isAdmin: jest.fn().mockResolvedValue(false),
      getDashboardSnapshot,
    });
    await render(withProviders(<AdminDashboardScreen onBack={jest.fn()} loadRepository={loadRepository} />));

    await waitFor(() => expect(screen.getByText('Administrator access required')).toBeOnTheScreen());
    expect(getDashboardSnapshot).not.toHaveBeenCalled();
  });

  it('renders the real aggregate stats for an admin account', async () => {
    const loadRepository = jest.fn().mockResolvedValue({
      isAdmin: jest.fn().mockResolvedValue(true),
      getDashboardSnapshot: jest.fn().mockResolvedValue(snapshot),
    });
    await render(withProviders(<AdminDashboardScreen onBack={jest.fn()} loadRepository={loadRepository} />));

    await waitFor(() => expect(screen.getByText('All systems normal')).toBeOnTheScreen());
    expect(screen.getByText('42')).toBeOnTheScreen();
    expect(screen.getByText('Total users')).toBeOnTheScreen();
  });

  it('shows a critical banner when sync operations have failed', async () => {
    const loadRepository = jest.fn().mockResolvedValue({
      isAdmin: jest.fn().mockResolvedValue(true),
      getDashboardSnapshot: jest.fn().mockResolvedValue({ ...snapshot, failedSyncOperations: 3 }),
    });
    await render(withProviders(<AdminDashboardScreen onBack={jest.fn()} loadRepository={loadRepository} />));

    await waitFor(() =>
      expect(screen.getByText('Attention: failures detected')).toBeOnTheScreen(),
    );
  });

  it('surfaces a load error instead of crashing or showing stale data', async () => {
    const loadRepository = jest.fn().mockRejectedValue(new Error('network unreachable'));
    await render(withProviders(<AdminDashboardScreen onBack={jest.fn()} loadRepository={loadRepository} />));

    await waitFor(() => expect(screen.getByText('Could not load the dashboard')).toBeOnTheScreen());
    expect(screen.getByText('network unreachable')).toBeOnTheScreen();
  });

  it('reloads the snapshot when Refresh is pressed', async () => {
    const getDashboardSnapshot = jest.fn().mockResolvedValue(snapshot);
    const loadRepository = jest.fn().mockResolvedValue({
      isAdmin: jest.fn().mockResolvedValue(true),
      getDashboardSnapshot,
    });
    const user = userEvent.setup();
    await render(withProviders(<AdminDashboardScreen onBack={jest.fn()} loadRepository={loadRepository} />));

    await waitFor(() => expect(screen.getByText('All systems normal')).toBeOnTheScreen());
    await user.press(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => expect(getDashboardSnapshot).toHaveBeenCalledTimes(2));
  });

  it('calls onBack when Back is pressed', async () => {
    const onBack = jest.fn();
    const loadRepository = jest.fn().mockResolvedValue({
      isAdmin: jest.fn().mockResolvedValue(true),
      getDashboardSnapshot: jest.fn().mockResolvedValue(snapshot),
    });
    const user = userEvent.setup();
    await render(withProviders(<AdminDashboardScreen onBack={onBack} loadRepository={loadRepository} />));

    await waitFor(() => expect(screen.getByText('All systems normal')).toBeOnTheScreen());
    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
