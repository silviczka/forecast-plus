export function logProd(...args: unknown[]) {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log(...args);
  }
}
