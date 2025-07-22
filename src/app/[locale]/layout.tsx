import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import './globals.css'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string}; // ✅ NOT a Promise
}) {
  const {locale} = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={(await import(`../../../messages/${locale}.json`)).default}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
