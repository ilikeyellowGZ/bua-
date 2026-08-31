/**
 * Resolves with the promise's value, or with `fallback` if it hasn't settled
 * within `ms`. Never rejects: a rejected promise also resolves to `fallback`.
 * Use this to bound any UI-blocking await against a slow or hung dependency
 * (e.g. local persistence) so a screen can never wait forever.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}
