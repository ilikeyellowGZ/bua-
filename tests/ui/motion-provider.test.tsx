import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { MotionProvider, type MotionContextValue, useMotion } from '@/core/motion/motion-provider';

jest.mock('react-native-reanimated', () => {
  return {
    useReducedMotion: jest.fn(),
  };
});

const mockUseReducedMotion = useReducedMotion as jest.MockedFunction<typeof useReducedMotion>;

function MotionProbe() {
  const motion = useMotion();
  return <Text>{JSON.stringify(motion satisfies MotionContextValue)}</Text>;
}

describe('MotionProvider', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReset();
  });

  it('honors the native reduced-motion preference', async () => {
    mockUseReducedMotion.mockReturnValue(true);

    await render(
      <MotionProvider>
        <MotionProbe />
      </MotionProvider>,
    );

    expect(screen.getByText(/"reduceMotion":true/)).toHaveTextContent(/"screenTransitionMs":0/);
    expect(screen.getByText(/"reduceMotion":true/)).toHaveTextContent(/"celebrationEnabled":false/);
  });

  it('allows an explicit full-motion preference', async () => {
    mockUseReducedMotion.mockReturnValue(true);

    await render(
      <MotionProvider preference="full">
        <MotionProbe />
      </MotionProvider>,
    );

    expect(screen.getByText(/"reduceMotion":false/)).toHaveTextContent(/"screenTransitionMs":220/);
    expect(screen.getByText(/"reduceMotion":false/)).toHaveTextContent(/"celebrationEnabled":true/);
  });

  it('freezes travel and celebration in deterministic mode', async () => {
    mockUseReducedMotion.mockReturnValue(false);

    await render(
      <MotionProvider deterministic>
        <MotionProbe />
      </MotionProvider>,
    );

    expect(screen.getByText(/"deterministic":true/)).toHaveTextContent(/"screenTransitionMs":0/);
    expect(screen.getByText(/"deterministic":true/)).toHaveTextContent(
      /"celebrationEnabled":false/,
    );
  });
});
