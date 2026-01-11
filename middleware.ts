import createMiddleware from 'next-intl/middleware';
import { locales } from './lib/i18n/config';

export default createMiddleware({
  locales: locales as string[],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
