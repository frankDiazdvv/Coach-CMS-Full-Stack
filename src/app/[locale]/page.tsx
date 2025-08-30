import { useTranslations } from 'next-intl';
import { ChevronRight, Users, Calendar, Bell, BarChart3, Globe, Smartphone, Video, Target, Check, Star, ArrowRight } from 'lucide-react';
import LandingPageTopBar from '../components/LandingPageTopBar';
import Link from 'next/link';
import Image from 'next/image';

// Define constants
const loginPage = '/login';
const footerLogo = '/DarkBG-logo.svg';
const domain = 'https://litetrainer.com';
const ogImage = '/squareLogo.svg';

export const metadata = {
  // title: 'Lite Trainer — Beginner Friendly Fitness Coaching Software for Online & In-Person Coaches',
  title: 'Lite Trainer | Beginner Friendly Fitness Coaching Software',
  description: 'Affordable, simple client management for beginner fitness coaches. Built for the core needs of online or in-person coaches - no bloat, just essential features. English & Spanish support.',
  openGraph: {
    title: 'Lite Trainer | Beginner-Friendly Fitness Coaching Software for Online & In-Person Coaches',
    description: 'Beginner-friendly, affordable client management system for In-person & Online fitness coaches.',
    url: 'https://litetrainer.com',
    siteName: 'LITE Trainer',
    images: [
      {
        url: 'https://litetrainer.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'LITE Trainer dashboard preview with workout and nutrition planning',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LITE Trainer — Beginner Friendly Client Management System',
    description: 'Affordable, simple client management for beginner fitness coaches. Built for the core needs of online or in-person coaches — no bloat, just essential features.',
    images: ['https://litetrainer.com/opengraph-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico', 
  },
};


const features = [
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Complete Client Management',
    description: 'Create, edit, and manage all your clients’ information in one centralized dashboard. View everyone at a glance.',
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Weekly Workout & Nutrition Planning',
    description: 'Design comprehensive weekly schedules for workouts and nutrition. Track macros and meal planning with ease.',
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: 'Real-Time Workout Logging',
    description: 'Clients log completed workouts instantly. Get immediate notifications in your dashboard to stay connected.',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Smart Dashboard Analytics',
    description: 'See who’s working out today, track membership expirations, and visualize client distribution with interactive charts.',
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Bilingual Support',
    description: 'Full platform available in English and Spanish. Serve diverse clients with language options that work for everyone.',
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Mobile-First Client Experience',
    description: 'Clients access their workouts and meals on-the-go with a responsive, mobile-optimized interface.',
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: 'Video Tutorial Integration',
    description: 'Attach video tutorial links to any workout. Help clients master proper form and technique.',
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Macro & Meal Tracking',
    description: 'Nutrition coaches can track weekly macros and individual meal macros for precise dietary guidance.',
  },
];

export default function LiteTrainerLanding() {
  const t = useTranslations('LandingPage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-950 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <LandingPageTopBar />

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto text-center">
          <div className='flex flex-row mb-40'>
            <div className='w-full'>
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Star className="w-4 h-4 mr-2" />
                  {t('hero.badge') || 'Perfect for Beginner Coaches'}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  {t('hero.title1') || 'Simple Coaching'}
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#2A2DAF] to-[#B2CAF6] bg-clip-text text-transparent">
                  {t('hero.title2') || 'Made Powerful'}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                {t('hero.description') ||
                  'The perfect bridge between basic tools and expensive enterprise software.'}
                <span className="text-purple-300">LITE Trainer</span>
                {t('hero.description2') ||
                  'Weekly Workout & Nutrition Planning for Beginner Coaches — without the complexity or cost.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href={loginPage}>
                  <button className="cursor-pointer group bg-gradient-to-r from-purple-500 to-[#B2CAF6] text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center">
                    {t('hero.cta1') || 'Start Free Trial for Lite Trainer Coaching App'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="cursor-not-allowed text-white border border-white/30 px-6 mx-2 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
                  {t('hero.cta2') || 'Watch Demo'}
                </button>
              </div>
            </div>
            <div className='relative hidden w-full h-64 md:h-auto xl:block'>
              <img 
                src='./dashboardSC.webp'
                alt="Lite Trainer app dashboard showing weekly workout and nutrition plan" 
                fetchPriority='high'
                className='w-full h-full object-cover object-left'
              />
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="text-5xl font-bold bg-[#B2CAF6] bg-clip-text text-transparent mb-2">$9.99</div>
              <div className="text-gray-400">{t('stats.price') || 'Starting Price/Month'}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-[#B2CAF6] bg-clip-text text-transparent mb-2">15</div>
              <div className="text-gray-400">{t('stats.clients') || 'Clients Included'}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl bg-clip-text mb-2">🇺🇸 🇪🇸</div>
              <div className="text-gray-400">{t('stats.languages') || 'Languages Supported'}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('features.title1') || 'Everything You Need to'}
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-[#B2CAF6] bg-clip-text text-transparent">
                {t('features.title2') || 'Scale Your Coaching'}
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('features.description') || 'Focus on what matters most — coaching your clients. We handle the technology.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <article
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-200 transition-colors">
                  {t(`features.items.${index}.title`) || feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {t(`features.items.${index}.description`) || feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Lite Trainer Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {t('why.title1') || 'Why Choose'}
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('why.title2') || 'Lite Trainer?'}
                </span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('why.items.0.title') || 'No Learning Curve'}</h3>
                    <p className="text-gray-300">{t('why.items.0.description') || 'Intuitive design that feels familiar from day one. Start coaching, not learning software.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('why.items.1.title') || 'Perfect Bridge Solution'}</h3>
                    <p className="text-gray-300">{t('why.items.1.description') || 'Between basic tools and expensive enterprise software. Get professional features at a beginner-friendly price.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('why.items.2.title') || 'Core Features Focus'}</h3>
                    <p className="text-gray-300">{t('why.items.2.description') || 'We focus on what coaches actually need daily, without overwhelming you with unnecessary features.'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('why.growth.title') || 'Built for Growth'}</h3>
                  <p className="text-gray-300">{t('why.growth.description') || 'Start small, scale smartly'}</p>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('why.growth.features.0') || 'Client Management'}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('why.growth.features.1') || 'Workout Planning'}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('why.growth.features.2') || 'Nutrition Tracking'}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('why.growth.features.3') || 'Mobile Access'}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('why.growth.features.4') || 'Bilingual Support'}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('pricing.title1') || 'Simple, Transparent'}
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('pricing.title2') || ''}
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('pricing.description') || 'No hidden fees. No complicated tiers. Just honest pricing that grows with you.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <article className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricing.basic.title') || 'Basic Plan'}</h3>
                <p className="text-gray-400 mb-6">{t('pricing.basic.description') || 'Perfect for getting started'}</p>
                <div className="text-5xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">$9.99</span>
                </div>
                <p className="text-gray-400">{t('pricing.basic.per') || 'per month'}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.0') || 'Up to 10 clients'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.1') || 'First 3 clients free'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.2') || 'Complete client management'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.3') || 'Workout & nutrition planning'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.4') || 'Real-time notifications'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.5') || 'Mobile-friendly interface'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.6') || 'English & Spanish support'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.7') || 'Video tutorial integration'}</span>
                </div>
              </div>

              <Link href={loginPage}>
                <button className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
                  {t('pricing.basic.cta') || 'Get Started'}
                </button>
              </Link>
            </article>

            {/* VIP Plan */}
            <article className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {t('pricing.vip.coming') || 'Coming Soon'}
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricing.vip.title') || 'VIP Plan'}</h3>
                <p className="text-gray-400 mb-6">{t('pricing.vip.description') || 'Advanced features for scaling coaches'}</p>
                <div className="text-5xl font-bold text-white mb-2">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('pricing.vip.price') || 'TBA'}</span>
                </div>
                <p className="text-gray-400">{t('pricing.vip.per') || 'per month'}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.vip.features.0') || 'Up to 25 clients'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{t('pricing.vip.features.1') || 'All Basic plan features'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.2') || 'Specialized measurement system'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.3') || 'Advanced analytics'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.4') || 'Priority support'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.5') || 'More features in development'}</span>
                </div>
              </div>

              <button className="w-full bg-gray-600 text-gray-300 py-3 rounded-full font-semibold cursor-not-allowed">
                {t('pricing.vip.cta') || 'Notify Me When Available'}
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('cta.title1') || 'Ready to Transform'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('cta.title2') || 'Your Coaching Business?'}
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {t('cta.description') || 'Join the growing community of coaches who’ve discovered the perfect balance of simplicity and power.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={loginPage}>
              <button className="cursor-pointer group bg-gradient-to-r from-purple-500 to-[#B2CAF6] text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center">
                {t('cta.button') || 'Start Free Trial Now'}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-gray-400 text-sm">{t('cta.note') || 'No credit card required • 14-day free trial'}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src={footerLogo}
                alt="Lite Trainer Logo"
                width={150}
                height={40}
                priority={false}
                className="object-contain"
              />
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Lite Trainer. {t('footer.rights') || 'All rights reserved.'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



/*
I'm in the developing phase still. Honestly, I've been developing it since April. I've been taking it slow since I've also been learning with this application. 
But I believe I'm close to being able to launch the MVP. I mean, I already have it up on the Internet. I already bought a domain. I already have a landing page, a 
very simple one, but it works. I already implemented Stripe for payment processing. So let me explain the flow to you a little bit so you can have an idea of more 
or less what's happening. So a client, and by that I mean a coach, goes to the landing page. They review the important data, whatever, and then they decide to create 
an account. So they go to the sign-up page. They create their account. They place their name, email, their personal plans that they want to offer, and their cell 
phone number. That's it. They create their account with no credit card in between. They get three free client creations. So they can manage up to three clients without 
having to ever use their credit card. Once they hit the three-client creation mark, they will then hit a paywall. Once they hit the paywall, they have to either pay or 
stop using. So they pay the starter plan, and now they have up to 15 clients. I am planning on building a pro plan later on, but for now I want to launch the starter 
plan. The starter plan allows you to do basically everything. A coach will be able to create a client from the dashboard. This is how the dashboard looks like. 
You have the coach's name up top, a big button that says create client. Within the main section, you have a chart with every single client that has a workout due today. 
Underneath, you have three charts. One, it's a pie chart telling you all the clients that you currently have enrolled in plans organized by plan. You can view the 
percentage of all the plans that you have assigned to each client. In the middle, you have client logs. Every time a client does a workout successfully, and they log a 
message that they completed the workout, or they just simply completed the workout, it would show up in there as a line chart. To the right of that, you have a warnings 
chart where you will see all the clients which their membership is about to expire, or the ones which their membership has already expired. To the right of the screen, 
you have a long sidebar for notifications. Each time a client logs a workout, you will see their notification there. John Doe logged their workout on Wednesday. This is 
the message they left, and then the time stamp. That's basically it. To the left of the screen, you have a side nav menu for navigation. You have home, all clients, 
profile, about, and so on. When it comes to creating a client, the coach clicks that big button in the middle, and you see a modal for the client information. You start by 
filling out the personal information. Name, email, gender, weight, target weight, goal, what plan you want to assign for them, the expiring date for their plan, and then 
you see two buttons in the bottom. One to add a workout, and then one to add a nutrition plan. Once you click on either one of them, you will be taken to a new page, which 
is the workout or nutrition builder. In here, you can build their weekly workouts or nutrition plan, just for the week. You have an empty Monday through Sunday clean schedule. 
In there, you can add, for example, the workouts. If you want, I can explain that to you right now.
*/