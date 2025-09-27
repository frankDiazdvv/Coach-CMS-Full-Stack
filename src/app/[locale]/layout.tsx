import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import './globals.css';
import { Metadata } from 'next';
import Script from 'next/script';
export const metadata = {
  title: {
    default: 'LITE Trainer',
    template: '%s | LITE Trainer',
  },
  description: 'The simplest begginer-friendly client management system for fitness coaches.',
  twitter: {
    card: 'summary_large_image',
  },
};

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
    <html lang={locale} dir={locale === 'es' ? 'ltr' : 'ltr'} className='scroll-smooth'>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="LITE Trainer" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href={`https://litetrainer.com/${locale}`} />
        {/* Alternate language links */}
        <link rel="alternate" href="https://litetrainer.com/en" hrefLang="en" />
        <link rel="alternate" href="https://litetrainer.com/es" hrefLang="es" />
        <link rel="alternate" href="https://litetrainer.com/en" hrefLang="x-default" />
        {/* Sitemap */}
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-D3V2CMBLXP"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-D3V2CMBLXP');
        `}
      </Script>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}