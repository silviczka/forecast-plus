export function logProd(...args: any[]) {
  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.log(...args);
  }
}
