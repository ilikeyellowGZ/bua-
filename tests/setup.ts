jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  const builder = {
    delay: () => builder,
    duration: () => builder,
    reduceMotion: () => builder,
    withInitialValues: () => builder,
  };

  return {
    __esModule: true,
    default: { View },
    FadeInUp: builder,
    ReduceMotion: { System: 'system' },
    ZoomIn: builder,
    useReducedMotion: jest.fn(() => false),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  // Jest's official AsyncStorage mock is published as CommonJS.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
