'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Target, Globe } from 'lucide-react';
import Link from 'next/link';

export default function LandingPageTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loginPage = '/login';
  const topLogo = '/DarkBG-logo.svg';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-slate-900/90 backdrop-blur-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <img src={topLogo} alt="Logo" className="w-auto h-12" />
            
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            {/* Language Toggle */}
            <div className="relative group">
              <button className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Globe className="w-5 h-5 mr-2" />
                Language
              </button>
              <div className="absolute top-full mt-2 hidden group-hover:block bg-slate-800/95 backdrop-blur-lg rounded-lg py-2 w-32">
                <button className="cursor-pointer block w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                 🇺🇸 English
                </button>
                <button className="cursor-pointer block w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                 🇪🇸 Español
                </button>
              </div>
            </div>
            <Link href={loginPage} className="bg-gradient-to-r from-purple-500 to-[#B2CAF6] text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-lg rounded-lg mt-2 p-6 space-y-4">
            <a href="#features" className="block text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">Pricing</a>
            <div className="flex flex-col space-y-2">
              <button className="text-left text-gray-300 hover:text-white transition-colors flex items-center">
                🇺🇸 English
              </button>
              <button className="text-left text-gray-300 hover:text-white transition-colors flex items-center">
                🇪🇸 Español
              </button>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}