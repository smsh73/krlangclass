import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ms', 'ko'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  const validLocale = locale as Locale;
  return {
    locale: validLocale,
    messages: (await import(`../../public/locales/${validLocale}.json`)).default
  };
});
