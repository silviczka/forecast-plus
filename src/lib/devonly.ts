export const devOnly = (fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    fn();
  }
};
