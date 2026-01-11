import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default withNextIntl(nextConfig);
