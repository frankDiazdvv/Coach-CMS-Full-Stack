import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

// Pre-import messages for faster access
const messagesCache = {
  en: () => import('../../messages/en.json').then(m => m.default),
  es: () => import('../../messages/es.json').then(m => m.default),
};

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Use cached promise for messages
  return {
    locale,
    messages: await messagesCache[locale](),
  };
});