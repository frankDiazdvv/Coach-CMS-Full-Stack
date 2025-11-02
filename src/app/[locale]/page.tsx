import { useTranslations } from 'next-intl';
import { ChevronRight, Users, Calendar, Bell, BarChart3, Globe, Smartphone, Video, Target, Check, Star, ArrowRight, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import "flag-icons/css/flag-icons.min.css";
import heroIMG from '/public/dashboardSC.webp';
import dynamic from 'next/dynamic';

const DarkVeil = dynamic(() => import('../components/ui/DarkVeil'));
const LandingPageTopBar = dynamic(() => import('../components/LandingPageTopBar'));

const loginPage = '/login';
const signUpPage = '/sign-up';
const footerLogo = '/DarkBG-logo.svg';
const domain = 'https://litetrainer.com';
const ogImage = '/squareLogo.svg';

export const metadata = {
  // title: 'LITE Trainer — Beginner Friendly Fitness Coaching Software for Online & In-Person Coaches',
  title: 'LITE Trainer | Beginner Friendly Fitness Coaching Software',
  description: 'LITE Trainer is the #1 beginner-friendly coaching software for personal trainers. Manage workouts, nutrition, and clients in one simple app. Perfect for online fitness coaches starting out. Bilingual support in English and Spanish.',
  openGraph: {
    title: 'LITE Trainer | Beginner-Friendly Fitness Coaching Software for Online & In-Person Coaches',
    description: 'LITE Trainer is the #1 coaching software for beginner personal trainers. Manage workouts, nutrition, and clients in one simple app. Perfect for online fitness coaches starting out',
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
    description: 'LITE Trainer is the #1 coaching software for beginner personal trainers. Manage workouts, nutrition, and clients in one simple app. Perfect for online fitness coaches starting out',
    images: ['https://litetrainer.com/opengraph-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico', 
  },
  SoftwareApplication: {
    name: 'LITE Trainer',
    ApplicationCategory: 'FitnessSoftware / CoachingSoftware',
    OperatingSystem: 'Web, Mobile',
    Price: '$9.99/month (with 3 clients free)',
    offers: 'Up to 3 clients free, then $9.99/month for up to 15 clients',
  }
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
    <div className={`relative cursor-default min-h-screen bg-black text-white overflow-hidden`}>

      <div className="w-full h-[110rem] absolute">
        <DarkVeil warpAmount={3}/>
      </div>
      {/* Navigation */}
      <LandingPageTopBar />

       

      {/* Hero Section */}
      <main className="relative flex flex-col justify-center items-center h-dvh md:pt-10 px-4 sm:px-6 lg:px-20">
        <div className="max-w-8xl mx-auto text-center">
          <div className='flex flex-row'>
            <div className='w-full flex flex-col justify-between'>  
              <div>
                <div className="my-8">
                  <span className="inline-flex items-center px-5 py-2 md:py-2.5 rounded-full text-sm bg-white/5 text-zinc-300 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300">
                    <Star className="w-4 h-4 mr-2 text-yellow-400" />
                    {t('hero.badge') || 'Featured on GoodFirms'}
                    <Link href={'http://www.goodfirms.com/'} target="_blank" className='hover:opacity-80 transition-opacity pl-2'>
                      <Image
                        src={'/goodFirmsLogo.png'}
                        alt="GoodFirms Logo"
                        loading='lazy'
                        width={120}
                        height={20}
                      />
                    </Link>
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl 2xl:text-8xl mb-6 md:mb-8 leading-none">
                  <span className="bg-white bg-clip-text font-normal text-transparent text-shadow-2xs">
                    {t('hero.title1') || 'Smart Coaching'}
                  </span>
                  <br/>
                  <span className="font-normal bg-linear-to-r from-[#2A2DAF] to-[#B2CAF6] bg-clip-text text-transparent text-shadow-sm">
                    {t('hero.title2') || 'Made Affordable'}
                  </span>
                </h1>

                <p className="font-light text-md md:text-xl xl:text-2xl text-gray-300 max-w-4xl mx-auto leading-normal pb-24 md:pb-20">
                  {t('hero.description') ||
                    'The #1 bridge between basic tools and expensive enterprise software.'}
                  {t('hero.description2') ||
                    'Weekly Workout & Nutrition Planning for Beginner Coaches — without the complexity or cost.'}
                </p>
              </div>

              {/* JOIN BUTTON */}
              <div className="flex flex-row gap-4 justify-center items-center sm:items-start mb-12">
                <div className='flex flex-col items-center'>
                  <Link href={signUpPage}>
                    <button className="cursor-pointer group bg-linear-to-r from-purple-800 to-blue-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center">
                      {t('hero.cta1') || 'Start Free Trial for LITE Trainer Coaching App'}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <p className='text-sm text-gray-300 mt-1'>🚀 {t("hero.underButton")}</p>
                </div>
                
                {/* <button className="cursor-not-allowed text-white border border-white/30 px-6 mx-2 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
                  {t('hero.cta2') || 'Watch Demo'}
                </button> */}
              </div>
            </div>
            <div className='relative hidden w-full h-64 md:h-auto xl:block'>
              <Image
                src={heroIMG}
                alt="Image: LITE Trainer app dashboard showing weekly workout and nutrition plan" 
                priority={true}
                width={900}
                height={700}
                placeholder="blur"
                className='w-full h-full object-cover object-left'
              />
            </div>
          </div>
        </div>
        <Link href="/#start-free" scroll={true} className='absolute bottom-10 rounded-full p-2 border-2 border-gray-200/70 text-gray-200/70 text-2xl animate-bounce'>
          <ArrowDown />
        </Link>
      </main>

      {/* Stats */}
      <div id='start-free' className="grid grid-cols-1 md:grid-cols-3 gap-8 my-40">
        <h2 className='flex justify-center md:col-span-3 text-3xl md:text-6xl font-light mb-12 z-10'>{t("freePlan.startCoaching")}<span className='rounded-lg bg-[#1b50b3] p-2 mx-2 -rotate-3 font-semibold'> {t("stats.free")}</span></h2>
        <div className="text-center z-10">
          <div className="text-4xl md:text-6xl font-thin text-[#6e9ef8] mb-2">{t("stats.free")}</div>
          <div className="text-gray-400">{t('stats.price') || 'Starting Price/Month'}</div>
        </div>
        <div className="text-center z-10">
          <div className="text-4xl md:text-6xl font-thin bg-[#6e9ef8] bg-clip-text text-transparent mb-2">3</div>
          <div className="text-gray-400">{t('stats.clients') || 'Clients Included'}</div>
        </div>
        <div className="text-center z-10">
          <div className="text-6xl bg-clip-text mb-2"><span className='fi fi-us'></span> <span className='fi fi-es'></span></div>
          <div className="text-gray-400">{t('stats.languages') || 'Languages Supported'}</div>
        </div>
        <div className='flex justify-center items-center md:col-span-3 mt-12 gap-3 z-10'>
          <p className='text-xl max-w-3xl'>{t("freePlan.moreClients")}</p>
          <Link href='#pricing'>
            <button className='cursor-pointer group bg-blue-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center'>
              {t("freePlan.exploreMore")}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
        </div>
        <div className='flex flex-row gap-2 items-center justify-center md:col-span-3 z-10'>
          <p>{t("hero.badge")}</p>
          <Link href={'http://www.goodfirms.com/'} target="_blank" className='hover:opacity-80 transition-opacity'>
            <Image
              src={'/goodFirmsLogo.png'}
              alt="GoodFirms Logo"
              loading='lazy'
              width={150}
              height={40}
            />
          </Link>
        </div>
      </div> 

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-light mb-6">
              <span className="">
                {t('features.title1') || 'Everything You Need to'}
              </span>
              <br />
              <span className="bg-linear-to-r from-purple-400 to-[#B2CAF6] bg-clip-text text-transparent">
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
      {/* embedded video tutorial */}
      
      <section id='video-demo'>
        <div className="flex flex-col md:flex-row justify-center gap-4 items-center min-h-screen">
          <div className="w-full max-w-3xl aspect-video z-10">
            <iframe
              className="w-full h-full rounded-2xl shadow-lg"
              src="https://www.youtube.com/embed/KHSpe19NfZE?si=cr0t8Zx1chTgjMQ8" 
              title="LITE Trainer Create account and client Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className='max-w-lg p-4 font-thin z-10'>
            <h2 className='text-4xl md:text-5xl text-center md:text-left font-thin mb-4 md:mb-8'>{t("tutorials.title1")}</h2>
            <p className='text-lg text-gray-300'>{t("tutorials.title2")}</p>
            <ol className='text-lg text-gray-300 list-disc list-inside mt-2 md:mt-4 pl-2 space-y-2'>
              <li>{t("tutorials.ol1")}</li>
              <li>{t("tutorials.ol2")}</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Why LITE Trainer Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-thin mb-8">
                <span className="">
                  {t('why.title1') || 'Why Choose'}
                </span>
                <br />
                <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('why.title2') || 'LITE Trainer?'}
                </span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('why.items.0.title') || 'No Learning Curve'}</h3>
                    <p className="text-gray-400">{t('why.items.0.description') || 'Intuitive design that feels familiar from day one. Start coaching, not learning software.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('why.items.1.title') || 'Perfect Bridge Solution'}</h3>
                    <p className="text-gray-400">{t('why.items.1.description') || 'Between basic tools and expensive enterprise software. Get professional features at a beginner-friendly price.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('why.items.2.title') || 'Core Features Focus'}</h3>
                    <p className="text-gray-400">{t('why.items.2.description') || 'We focus on what coaches actually need daily, without overwhelming you with unnecessary features.'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-purple-500/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10 hover:scale-[1.02] transition-transform">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-thin text-white">{t('why.growth.title') || 'Built for Growth'}</h3>
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
            <h2 className="flex flex-col md:flex-row justify-center text-center md:gap-2 text-4xl md:text-5xl font-thin mb-4">
              <span className=" ">
                {t('pricing.title1') || 'Simple, Transparent'}
              </span>
              <br />
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent pb-2">
                {t('pricing.title2') || ''}
              </span>
            </h2>
            <p className="text-xl font-light text-gray-400 max-w-3xl mx-auto">
              {t('pricing.description') || 'No hidden fees. No complicated tiers. Just honest pricing that grows with you.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <article className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center mb-8 font-thin">
                <h3 className="text-3xl text-white mb-2">{t('pricing.basic.title') || 'Basic Plan'}</h3>
                <p className="text-gray-400 mb-6">{t('pricing.basic.description') || 'Perfect for getting started'}</p>
                <div className="text-5xl text-white">
                  <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">$9.99</span>
                </div>
                <p className="text-gray-400">{t('pricing.basic.per') || 'per month'}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.0') || 'Up to 15 clients'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.1') || 'First 3 clients free'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.2') || 'Complete client management'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.3') || 'Workout & nutrition planning'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.4') || 'Real-time notifications'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.5') || 'Mobile-friendly interface'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.6') || 'English & Spanish support'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.basic.features.7') || 'Video tutorial integration'}</span>
                </div>
              </div>

              <Link href={signUpPage}>
                <button className="cursor-pointer w-full bg-linear-to-r from-purple-600/50 to-pink-600/50 text-white py-3 rounded-full font-thin hover:from-purple-600/70 hover:to-pink-600/70 transition-all transform hover:scale-105">
                  {t('pricing.basic.cta') || 'Get Started'}
                </button>
              </Link>
            </article>

            {/* VIP Plan */}
            <article className="relative bg-linear-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {t('pricing.vip.coming') || 'Coming Soon'}
                </span>
              </div>

              <div className="text-center mb-8 font-thin">
                <h3 className="text-3xl text-white mb-2">{t('pricing.vip.title') || 'VIP Plan'}</h3>
                <p className="text-gray-400 mb-6">{t('pricing.vip.description') || 'Advanced features for scaling coaches'}</p>
                <div className="text-5xl text-white">
                  <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('pricing.vip.price') || 'TBA'}</span>
                </div>
                <p className="text-gray-400">{t('pricing.vip.per') || 'per month'}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.vip.features.0') || 'Up to 25 clients'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-gray-300">{t('pricing.vip.features.1') || 'All Basic plan features'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.2') || 'Specialized measurement system'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.3') || 'Advanced analytics'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.4') || 'Priority support'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-purple-300">{t('pricing.vip.features.5') || 'More features in development'}</span>
                </div>
              </div>

              <button className="w-full bg-gray-600 text-gray-300 py-3 rounded-full font-thin cursor-not-allowed">
                {t('pricing.vip.cta') || 'Notify Me When Available'}
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-thin mb-6">
            <span className="">
              {t('cta.title1') || 'Ready to Transform'}
            </span>
            <br />
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('cta.title2') || 'Your Coaching Business?'}
            </span>
          </h2>
          <p className="text-xl font-thin text-gray-400 mb-10 max-w-2xl mx-auto">
            {t('cta.description') || 'Join the growing community of coaches who’ve discovered the perfect balance of simplicity and power.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={signUpPage}>
              <button className="cursor-pointer group bg-linear-to-r from-purple-500 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50 flex items-center">
                {t('cta.button') || 'Start Free Trial Now'}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-gray-400 text-sm">{t('cta.note') || 'No credit card required • 14-day free trial'}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src={footerLogo}
                alt="LITE Trainer Logo"
                loading='lazy'
                width={150}
                height={40}
                priority={false}
                className="object-contain"
              />
            </div>
            <div className='flex flex-row gap-6'>
              <Link 
                href={'https://www.youtube.com/@litetrainer'}
                target="_blank"
                className='flex flex-row gap-0.5 opacity-90 hover:opacity-100'
              >
                <Image
                  src={'./youtube-icon-white.svg'}
                  alt="Youtube Channel"
                  loading='lazy'
                  width={24}
                  height={24}
                />
                <p>Youtube</p>
              </Link>
              <Link 
                href={'https://www.linkedin.com/company/lite-trainer/posts/?feedView=all'}
                target="_blank"
                className='flex flex-row gap-0.5 opacity-90 hover:opacity-100'
              >
                <Image
                  src={'./linkedin-icon-white.svg'}
                  alt="LinkedIn Profile"
                  loading='lazy'
                  width={24}
                  height={24}
                />
                <p>Linkedin</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex mt-10 mb-4 text-gray-400 text-sm justify-center">
          © {new Date().getFullYear()} LITE Trainer. {t('footer.rights') || 'All rights reserved.'}
        </div>
      </footer>
      
    </div>
  );
}