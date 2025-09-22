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
            <img src={topLogo} alt="Logo" className="w-auto h-12" />
            
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">{t("features")}</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">{t("pricing")}</a>
            <a href="#video-demo" className="text-gray-300 hover:text-white transition-colors">{t("tutorials")}</a>
            <LanguageToggle/>
            <Link href={signUpPage} className="bg-gradient-to-r from-purple-800 to-[#416bbb] text-white text-lg font-semibold px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              {t("getStarted")}
            </Link>
            <Link href={loginPage} className="bg-gradient-to-r from-purple-300 to-[#b5c9ed] text-purple-950 text-lg font-semibold px-6 py-2 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              {t("signIn")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            name='Menu Button'
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-lg rounded-lg mt-2 p-6 space-y-4">
            <a href="#features" className="block text-gray-300 hover:text-white transition-colors">{t("features")}</a>
            <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">{t("pricing")}</a>
            <LanguageToggle/>
            <Link href={'./login'}>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                {t("getStarted")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}