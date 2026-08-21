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
