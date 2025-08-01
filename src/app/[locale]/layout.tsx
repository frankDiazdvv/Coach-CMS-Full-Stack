import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import './globals.css';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={locale === 'es' ? 'ltr' : 'ltr'}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Favicon */}
        <link rel="icon" href="/squareLogo.svg" />
        {/* Alternate language links */}
        <link rel="alternate" href="https://litetrainer.com/en" hrefLang="en" />
        <link rel="alternate" href="https://litetrainer.com/es" hrefLang="es" />
        <link rel="alternate" href="https://litetrainer.com/en" hrefLang="x-default" />
        {/* Sitemap */}
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}