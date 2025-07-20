'use client'

import { useState, useEffect, useCallback } from "react";
import { IClient } from "../../../../lib/models/clients";
import { ICoach } from "../../../../lib/models/coach";
import { Locale, useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineMail } from "react-icons/hi";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const ClientProfilePage: React.FC = () => {
    const t = useTranslations();
    const locale: string = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [userData, setUserData] = useState<IClient | null>(null);
    const [coachData, setCoachData] = useState<ICoach | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const WhatsAppLogo = '/WhatsAppLogo_White.svg';


    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('id');
        if (!token || !id) {
            setError('No token or client ID found');
            setIsLoading(false);
            return;
        }

        try {
            // Fetch USER DATA
            const response = await fetch(`/api/client/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Failed to fetch User Data');
            }
            
            const clientData = await response.json();
            setUserData(clientData);

        } catch (error) {
            console.error('Error fetching profile data:', error);
            setError('Failed to fetch profile data');
        } finally {
            setIsLoading(false);
        }
    };

    
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            const id = localStorage.getItem('id');
            if (!id) {
                setError('No client ID in localStorage');
                setIsLoading(false);
                return;
            }

            try {
                // Fetch user data first
                await fetchData();
                // Fetch coach data only after user data is fetched
                if (userData?.coach) {
                    await fetchCoachData();
                } else {
                    console.warn('No coach ID found in userData');
                }
            } catch (err) {
                console.error('Error initializing data:', err);
                setError('Failed to initialize data');
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, [userData?.coach]);


    const fetchCoachData = async () => {
        const token = localStorage.getItem('token');
        const coachID = userData?.coach.toString();
        if (!token || !coachID) {
            setError('No token or coach ID found');
            return;
        }
        // FETCH COACH DATA
        try {
            const coachResponse = await fetch(`/api/coaches/${coachID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!coachResponse.ok) {
                const { message } = await coachResponse.json();
                throw new Error(message || 'Failed to fetch coach data');
            }

            const coachData = await coachResponse.json();
            setCoachData(coachData);
        } catch (error) {
            console.error('Error fetching coach data:', error);
            setError('Failed to fetch coach data');
        }
    };


    function onSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value as Locale;

        // Manually set the cookie
        document.cookie = `USER_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax` // 1 year

        const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        router.replace(pathWithoutLocale, { locale: nextLocale });
    }

    const getLanguageFlag = (lang: string) => {
        switch (lang.toLowerCase()) {
            case 'en':
                return '🇺🇸';
            case 'es':
                return '🇪🇸';
            default:
                return '🌐';
        }
    };

    const getLanguageName = (lang: string) => {
        switch (lang.toLowerCase()) {
            case 'en':
                return 'English';
            case 'es':
                return 'Español';
            default:
                return lang.toUpperCase();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">{t("loadingProfile")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 text-2xl">⚠️</span>
                        </div>
                        <p className="text-red-600 text-lg font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 mb-20">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        {t('userProfileTitleBeforeName')}
                        <span className="text-green-600">
                            {t('userPrifileTitleName', { name: userData?.firstName || 'User' })}
                        </span> 
                        {t('userProfileTitleAfterName')}
                    </h1>
                    <p className="text-gray-600">{t("manageAccountSubtitle")}</p>
                </div>

                {/* Coach Information */}
                <div className="mb-6 border-b border-slate-300 pb-6">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">🎯</span>
                                {t("coachInfo")}
                            </h2>
                        </div>
                        
                        <div className="p-2">
                            {!isLoading ? (
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-emerald-900 p-3 mb-2 border rounded-xl border-slate-300 bg-emerald-50">
                                            Coach: <span className="font-medium text-gray-500">{coachData?.name}</span>
                                        </h3>
                                        <div className="flex flex-row flex-nowrap gap-2">
                                            <button className="bg-blue-500/90 px-4 py-2 w-1/2 rounded-2xl border border-blue-800">
                                                <Link href={`mailto:${coachData?.email}?body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0ASent%20from%20SimpleFit%20CMS`} target='_blank'>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white text-2xl"><HiOutlineMail/></span>
                                                        <div>
                                                            <h3 className="font-semibold text-white">{t("sendEmail")}</h3>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </button>
                                        
                                            <button className="bg-green-500/90 px-4 py-2 w-1/2 rounded-2xl border border-green-800">
                                                <Link href={`https://wa.me/${coachData?.phone.replace(/[^0-9]/g, '')}`} target='_blank'>
                                                    <div className="flex items-center">
                                                        <Image src={WhatsAppLogo} alt="WhatsApp Logo" width={25} height={25}/>
                                                        <div>
                                                            <h3 className="font-bold text-white text-wrap pl-2">{t("messageOnWhatsApp")}</h3>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">👨‍💼</span>
                                    </div>
                                    <p className="text-lg text-gray-600 font-medium">{t("noCoach")}</p>
                                    <p className="text-gray-500 mt-2">{t("noCoachSubtitle")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Profile Overview Card */}
                <div className="mb-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">👤</span>
                                {t("profileOverview")}
                            </h2>
                        </div>
                        
                        <div className="p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">{t("personalInformation")}</h3>
                                    <div className="space-y-2">
                                        <p className="text-gray-700">
                                            <span className="font-semibold">{t("fullName")}:</span> {userData?.firstName} {userData?.lastName}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">{t("memberSince")}:</span> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">📞</span>
                                {t("myContactInformation")}
                            </h2>
                        </div>

                        <div className="p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
                                    <div className="flex items-center mb-0">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-blue-600 text-lg">📧</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Email Address</h3>
                                            <p className="text-gray-600">{userData?.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200">
                                    <div className="flex items-center mb-0">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-green-600 text-lg">📱</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Phone Number</h3>
                                            <p className="text-gray-600">{userData?.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Membership Information */}
                <div className="mb-6 pb-6 border-b border-slate-300">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">💎</span>
                                {t("membershipDetails")}
                            </h2>
                        </div>
                        
                        <div className="p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200">
                                    <div className="flex items-center mb-0">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-yellow-600 text-lg">🏆</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-yellow-900">{t("planAssigned")}</h3>
                                            <p className="text-yellow-800 font-medium">{userData?.planAssigned || t('unknownPlan')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200">
                                    <div className="flex items-center mb-0">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-red-600 text-lg">📅</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-red-900">{t("planExpires")}</h3>
                                            <p className="text-red-800 font-medium">
                                                {userData?.planExpires ? new Date(userData.planExpires).toLocaleDateString() : t("noExpirationDate")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Setting */}
                <div className="mb-6">
                     <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 
                                    0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 
                                    1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 
                                    0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 
                                    001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{t("settings")}</h2>
                        </div>

                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-3">
                                {t("language")}
                            </label>
                            <div className="relative">
                                <select
                                    name="language"
                                    id="language"
                                    defaultValue={locale}
                                    onChange={onSelectChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                >
                                    {routing.locales.map((lang) => (
                                        <option key={lang} value={lang}>
                                            {getLanguageFlag(lang)} {getLanguageName(lang)}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientProfilePage;