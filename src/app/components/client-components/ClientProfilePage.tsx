'use client'

import { useState, useEffect } from "react";
import { IClient } from "../../../../lib/models/clients";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ICoach } from "../../../../lib/models/coach";

const ClientProfilePage: React.FC = () => {
    const t = useTranslations();
    const [userData, setUserData] = useState<IClient | null>(null);
    const [coachData, setCoachData] = useState<ICoach | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>('');
    const WhatsAppLogo = '/WhatsAppLogo.png';

    useEffect(() => {
        setClientName(localStorage.getItem('name') || 'User');

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('userProfileTitleBeforeName')}
                        <span className="text-green-600">
                            {t('userPrifileTitleName', { name: userData?.firstName || 'User' })}
                        </span> 
                        {t('userProfileTitleAfterName')}
                    </h1>
                    <p className="text-gray-600">Manage your account and view your information</p>
                </div>

                {/* Coach Information */}
                <div className="mb-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">🎯</span>
                                Your Coach
                            </h2>
                        </div>
                        
                        <div className="p-2">
                            {coachData ? (
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-emerald-900 py-2">
                                            Your Coach: <span>{coachData?.name}</span>
                                        </h3>
                                        <div className="flex flex-row flex-nowrap gap-2">
                                                <button className="bg-blue-100 px-4 py-2 w-1/2 rounded-2xl border border-gray-300">
                                                    <Link href={`mailto:${coachData?.email}?body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0ASent%20from%20SimpleFit%20CMS`} target='_blank'>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-blue-600 text-2xl">📧</span>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">Send an Email</h3>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </button>
                                            
                                                <button className="bg-green-100 px-4 py-2 w-1/2 rounded-2xl border border-gray-300">
                                                    <Link href={`https://wa.me/${coachData?.phone.replace(/[^0-9]/g, '')}`} target='_blank'>
                                                        <div className="flex items-center">
                                                            <Image src={WhatsAppLogo} alt="WhatsApp Logo" width={25} height={25}/>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 text-wrap">Contact on WhatsApp</h3>
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
                                    <p className="text-lg text-gray-600 font-medium">No coach assigned</p>
                                    <p className="text-gray-500 mt-2">A coach will be assigned to you soon</p>
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
                                Profile Overview
                            </h2>
                        </div>
                        
                        <div className="p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Personal Information</h3>
                                    <div className="space-y-2">
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Full Name:</span> {userData?.firstName} {userData?.lastName}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Member Since:</span> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
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
                                My Contact Information
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
                <div className="mb-4">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <span className="text-2xl mr-3">💎</span>
                                Membership Information
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
                                            <h3 className="font-semibold text-yellow-900">Current Plan</h3>
                                            <p className="text-yellow-800 font-medium">{userData?.planAssigned || 'No plan assigned'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200">
                                    <div className="flex items-center mb-0">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-red-600 text-lg">📅</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-red-900">Plan Expires</h3>
                                            <p className="text-red-800 font-medium">
                                                {userData?.planExpires ? new Date(userData.planExpires).toLocaleDateString() : 'No expiration date'}
                                            </p>
                                        </div>
                                    </div>
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