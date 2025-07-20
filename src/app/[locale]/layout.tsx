import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import './globals.css';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, params.locale)) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider locale={params.locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}