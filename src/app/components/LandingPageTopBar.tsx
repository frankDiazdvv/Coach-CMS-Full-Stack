'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import LanguageToggle from './ui/languageToggle';
import { useTranslations } from 'next-intl';

export default function LandingPageTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const t = useTranslations();

  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loginPage = '/login';
  const signUpPage = '/sign-up';
  const topLogo = '/DarkBG-logo.svg';

  

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-slate-900/90 backdrop-blur-lg' : 'bg-transparent'}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href={"/"} scroll={true}>
              <img src={topLogo} alt="Logo" className="w-auto h-12" />
            </Link>       
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-6">
            <Link href="/#features" scroll={true} className="text-gray-300 hover:text-white transition-colors">{t("features")}</Link>
            <Link href="/#video-demo" scroll={true} className="text-gray-300 hover:text-white transition-colors">{t("tutorials")}</Link>
            <Link href="/#pricing" scroll={true} className="text-gray-300 hover:text-white transition-colors">{t("pricing")}</Link>
            <Link href="/resources/food-db" scroll={true} className="text-gray-300 hover:text-white transition-colors">{t("resources")}</Link>

            <LanguageToggle/>
            <Link href={signUpPage} className="bg-linear-to-r from-purple-800 to-[#416bbb] text-white text-lg font-semibold px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              {t("getStarted")}
            </Link>
            <Link href={loginPage} className="bg-linear-to-r from-purple-300 to-[#b5c9ed] text-purple-950 text-lg font-semibold px-6 py-2 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              {t("signIn")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden text-white hover:cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            name='Menu Button'
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden bg-slate-800/95 backdrop-blur-lg rounded-lg mt-2 p-6 space-y-4 transform transition-transform duration-1000 ease-in-out mb-6">
            
            <Link href="/#features" scroll={true} className="block text-gray-300 hover:text-white transition-colors">{t("features")}</Link>
            <Link href="/#video-demo" scroll={true} className="block text-gray-300 hover:text-white transition-colors">{t("tutorials")}</Link>
            <Link href="/#pricing" scroll={true} className="block text-gray-300 hover:text-white transition-colors">{t("pricing")}</Link>
            <Link href="/resources/food-db" scroll={true} className="block text-gray-300 hover:text-white transition-colors">{t("resources")}</Link>

            <LanguageToggle/>
            <Link href={'./sign-up'}>
              <button className="w-full bg-linear-to-r from-blue-700 to-red-700 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                {t("getStarted")}
              </button>
            </Link>
            <Link href={'./login'}>
              <button className="w-full mt-3 bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                {t("signIn")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}