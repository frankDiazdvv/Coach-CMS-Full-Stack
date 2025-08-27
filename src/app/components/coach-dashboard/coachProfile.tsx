'use client';

import { Types } from "mongoose";
import { Locale, useLocale, useTranslations } from "next-intl";
import { useState, useEffect, FormEvent } from "react";
import { ICoach } from "../../../../lib/models/coach";
import { routing } from "@/i18n/routing";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import MembershipButtons from "./MembershipButtons";
import { Sparkles, ClipboardPlus, Dumbbell } from "lucide-react"

const CoachProfile: React.FC = () => {
    const locale: string = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();    
    const [coachId, setCoachId] = useState<Types.ObjectId | null>(null);
    const [coach, setCoach] = useState<ICoach | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [plans, setPlans] = useState<string[]>([]);
    const [newPlan, setNewPlan] = useState('');
    const [planName, setPlanName] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('id');
            const token = localStorage.getItem('token');
            if (id) {
                try {
                    setCoachId(new Types.ObjectId(id));
                } catch (err) {
                    console.error('Invalid coach ID:', err);
                    setError(t('invalidCoachId'));
                    setIsLoading(false);
                }
            } else if (!token) {
                setError('Log in before accessing!');
            } else {
                console.error('No coach ID in localStorage');
                setError(t('noCoachId'));
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (coachId) {
            fetchData();
        }
    }, [coachId]);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const loggedCoachId = localStorage.getItem('id');

        if (!token || !loggedCoachId) {
            console.error('Missing token or coach ID:', { token, loggedCoachId });
            setError(t('notAuthenticated'));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/coaches/${loggedCoachId}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                setError('Failed to fetch profile');
                setIsLoading(false);
                return;
            }
            const coachData = await response.json();
            setCoach(coachData);
            setName(coachData.name || '');
            setEmail(coachData.email || '');
            setPhone(coachData.phone || '');
            setPlans(coachData.plans || []);
            setPlanName(coachData.planName);
            setIsSubscribed(coachData.isSubscribed);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t("genericError");
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token || !coachId) return;

        try {
            const response = await fetch(`/api/coaches/${coachId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone, plans }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedCoach = await response.json();
            setCoach(updatedCoach);
            setError('Profile updated successfully!');
            setTimeout(() => setError(''), 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t("genericError");
            setError(message);
        }
    };

    const handleDeleteCoachAccount = async () => {
        if (!confirm(t('confirmDeleteAccount'))) {
            return;
        }
        const coachId = localStorage.getItem('id');

        if (!coachId) {
            setError(t('noCoachId'));
            return;
        }

        try{
            const response = await fetch(`/api/coaches/${coachId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coachId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Clear localStorage and redirect to homepage or login page
            localStorage.removeItem('token');
            localStorage.removeItem('id');
            router.push('/');

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t("genericError");
            setError(message);
        }
    }

    const addPlan = () => {
        if (newPlan.trim()) {
            setPlans([...plans, newPlan.trim()]);
            setNewPlan('');
        }
    };

    const removePlan = (index: number) => {
        setPlans(plans.filter((_, i) => i !== index));
    };

    const updatePlan = (index: number, value: string) => {
        const newPlans = [...plans];
        newPlans[index] = value;
        setPlans(newPlans);
    };

    function onSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value as Locale;
        const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

        // Use router.replace with locale, and force a reload if needed
        router.replace(pathWithoutLocale, { locale: nextLocale });

        // Optional: Force a full page reload to ensure middleware re-runs
        // This is a fallback if client-side navigation fails in deployment
        setTimeout(() => {
            if (document.documentElement.lang !== nextLocale) {
                window.location.href = `/${nextLocale}${pathWithoutLocale}`;
            }
        }, 100); // Small delay to allow router.replace to attempt first
    }

    const handleManageBilling = () => {
        window.location.href = "https://billing.stripe.com/p/login/6oUaEYb0u06v0LJ5ao7kc00";
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="animate-pulse">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="h-6 bg-gray-200 rounded-full w-32 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-24 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !coach) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 absolute left-0 md:left-20 right-0 top-0 bottom-0 pb-20 md:pb-4 overflow-auto">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t("coachProfile")}</h1>
                            <p className="text-gray-600">{t("coachProfileSubtitle")}</p>
                        </div>
                    </div>
                    
                    {error && coach && (
                        <div className={`p-4 rounded-lg mb-4 ${
                            error.includes('success') 
                                ? 'bg-green-50 border border-green-200 text-green-800' 
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {error.includes('success') ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    )}
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Profile Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{t('personalInformation')}</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t("fullName")}
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            {t("emailAddress")}
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t("phoneNumber")}
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Training Plans Section */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <label className="text-xl font-bold text-black">{t("trainingPlans")}</label>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {plans.map((plan, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <input
                                                    type="text"
                                                    value={plan}
                                                    onChange={(e) => updatePlan(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                                                    placeholder="Plan name"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePlan(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newPlan}
                                                onChange={(e) => setNewPlan(e.target.value)}
                                                placeholder={t("addPlanPlaceholder")}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={addPlan}
                                                className="px-6 py-3 bg-green-600 text-white rounded-xl cursor-pointer hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                {t("addPlan")}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t("saveChanges")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    {/* Settings & Membership Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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

                        {/* Membership Section */}
                        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Your Current Plan</h2>
                            </div>
                            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <p className="text-lg">
                                    <span className="font-semibold">{isSubscribed ? `${planName}\u00A0` : 'Free Plan\u00A0'}</span>
                                    — {isSubscribed ? '$15/mo, up to 25 clients' : 'Free, up to 3 clients'}
                                </p>
                            </div>
                            {/* Check if client is subscribed */}
                            {coach && coach.isSubscribed ? (
                                <div className="mt-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Dumbbell className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Manage Your Membership</h2>
                                    </div>
                                    <button
                                        onClick={handleManageBilling}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                    >
                                        Manage Billing
                                    </button>       
                                </div>                  
                            ) : (
                                <div className="mt-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <ClipboardPlus className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Become a member and enjoy more benefits</h2>
                                    </div>
                                    <div className="flex flex-row gap-4">
                                        <MembershipButtons coachId={coachId?.toString()!}/>    
                                    </div>
                                </div>   
                            )}
                        </div>
                        <div className="">
                            <button
                                className="w-full mt-8 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                onClick={handleDeleteCoachAccount}
                            >
                                DELETE COACH ACCOUNT
                            </button>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        </div>
    );
}

export default CoachProfile;