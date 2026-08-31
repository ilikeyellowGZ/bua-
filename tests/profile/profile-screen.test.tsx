import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { ProfileScreen } from '@/features/profile/profile-screen';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

const ownerId = '11111111-1111-4111-8111-111111111111';

function baseProps() {
  return {
    onOpenPremium: jest.fn(),
    onOpenPrivacy: jest.fn(),
    onOpenTerms: jest.fn(),
    onOpenAdmin: jest.fn(),
    onSignedOut: jest.fn(),
    loadOwnerId: jest.fn().mockResolvedValue(ownerId),
    loadProgressTracker: jest.fn().mockResolvedValue({
      getProgress: jest.fn().mockResolvedValue({
        ownerId,
        totalXP: 120,
        streak: { currentDays: 5, longestDays: 9, lastCompletedLocalDate: '2026-08-31' },
      }),
    }),
    loadAdminRepository: jest.fn().mockResolvedValue({
      isAdmin: jest.fn().mockResolvedValue(false),
    }),
    account: {
      getDeletionStatus: jest.fn().mockResolvedValue({ requestedAt: null }),
      requestDeletion: jest.fn().mockResolvedValue({ requestedAt: '2026-08-31T00:00:00.000Z' }),
      cancelDeletionRequest: jest.fn().mockResolvedValue(undefined),
    },
    auth: { signOut: jest.fn().mockResolvedValue(undefined) },
  };
}

describe('ProfileScreen', () => {
  it('renders the real streak and XP from the progress tracker instead of hardcoded values', async () => {
    const props = baseProps();
    await render(withProviders(<ProfileScreen {...props} />));

    await waitFor(() => expect(screen.getByText('5 day streak')).toBeOnTheScreen());
    expect(screen.getByText('120 XP earned')).toBeOnTheScreen();
    expect(props.loadOwnerId).toHaveBeenCalledTimes(1);
  });

  it('signs out through the injected auth repository and notifies the caller', async () => {
    const props = baseProps();
    const user = userEvent.setup();
    await render(withProviders(<ProfileScreen {...props} />));

    await waitFor(() => expect(screen.getByText('5 day streak')).toBeOnTheScreen());
    await user.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(props.auth.signOut).toHaveBeenCalledTimes(1);
    expect(props.onSignedOut).toHaveBeenCalledTimes(1);
  });

  it('requests account deletion only after explicit confirmation', async () => {
    const props = baseProps();
    const user = userEvent.setup();
    await render(withProviders(<ProfileScreen {...props} />));

    await waitFor(() => expect(screen.getByText('5 day streak')).toBeOnTheScreen());
    await user.press(screen.getByRole('button', { name: 'Delete my account' }));
    expect(props.account.requestDeletion).not.toHaveBeenCalled();

    expect(screen.getByText('Delete your account?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Yes, request deletion' }));

    expect(props.account.requestDeletion).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByText('Account deletion requested')).toBeOnTheScreen(),
    );
  });

  it('lets the user cancel a pending deletion request', async () => {
    const props = baseProps();
    props.account.getDeletionStatus.mockResolvedValue({ requestedAt: '2026-08-30T00:00:00.000Z' });
    const user = userEvent.setup();
    await render(withProviders(<ProfileScreen {...props} />));

    await waitFor(() =>
      expect(screen.getByText('Account deletion requested')).toBeOnTheScreen(),
    );
    await user.press(screen.getByRole('button', { name: 'Cancel deletion request' }));

    expect(props.account.cancelDeletionRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText('Delete my account')).toBeOnTheScreen());
  });

  it('hides the admin dashboard entry point for a non-admin account', async () => {
    const props = baseProps();
    await render(withProviders(<ProfileScreen {...props} />));

    await waitFor(() => expect(screen.getByText('5 day streak')).toBeOnTheScreen());
    expect(screen.queryByRole('button', { name: 'Admin dashboard' })).toBeNull();
  });

  it('shows and routes to the admin dashboard only for an admin account', async () => {
    const props = baseProps();
    props.loadAdminRepository.mockResolvedValue({ isAdmin: jest.fn().mockResolvedValue(true) });
    const user = userEvent.setup();
    await render(withProviders(<ProfileScreen {...props} />));

    const button = await screen.findByRole('button', { name: 'Admin dashboard' });
    await user.press(button);
    expect(props.onOpenAdmin).toHaveBeenCalledTimes(1);
  });
});
