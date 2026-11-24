/**
 * The visitor's IP address, used as the rate-limit identity.
 * On Vercel, x-forwarded-for is set by Vercel's edge, so visitors can't choose it.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'local';
}
