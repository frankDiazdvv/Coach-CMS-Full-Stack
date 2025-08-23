'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from "@/i18n/navigation";
import { Locale, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

export default function LanguageToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const locale: string = useLocale();
    const [languageOpen, setLanguageOpen] = useState(locale == "es");
    const t = useTranslations();


    const toggleLanguage = () => {
    const nextLocale: Locale = languageOpen ? "en" : "es"; // flip language
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

    // Update router locale
    router.replace(pathWithoutLocale, { locale: nextLocale });

    // Optional: fallback to full reload if needed
    setTimeout(() => {
        if (document.documentElement.lang !== nextLocale) {
        window.location.href = `/${nextLocale}${pathWithoutLocale}`;
        }
    }, 100);

    // Update toggle state
    setLanguageOpen(!languageOpen);
  };

    return(
        <div className="flex items-center space-x-2">
            <label htmlFor="langToggle" className='text-gray-300 hover:text-white cursor-pointer'>{t("language")}</label>
            <button
                id='langToggle'
                onClick={toggleLanguage}
                className={`w-12 h-7 flex items-center rounded-full p-0 cursor-pointer transition-colors duration-300 bg-gray-700`}
            >
            <div
                className={`${languageOpen ? "bg-[url(/spain_round.webp)] bg-center bg-size-[48px]" : "bg-[url(/us_round.webp)] bg-center bg-size-[48px]"} w-7 h-7 rounded-full shadow-md transform transition-all duration-400 ${
                languageOpen ? "translate-x-5" : ""
                }`}
            ></div>
            </button>
        </div>
    );
}
