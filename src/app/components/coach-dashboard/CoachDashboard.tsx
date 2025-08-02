//TODO:
// 1. Client Profile Page
// 2. Measurement Page(coach & Client)

'use client';

import {useTranslations} from 'next-intl';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IClient } from '../../../../lib/models/clients';
import { ICoach } from '../../../../lib/models/coach';
import { IWorkoutSchedule } from '../../../../lib/models/workouts';
import AddClientModal from './AddClientModal';
import { Types } from 'mongoose';
import { useSearchParams } from 'next/navigation';
import { WorkoutLog } from '../../../../lib/models/types';
import Link from 'next/link';
import TotalLogsByClientChart from './TotalLogChart';
import PieChartAllClients from './PieChartAllClients';

interface ClientWorkoutSummary {
  clientId: string;
  clientName: string; // The label for your Y-axis
  workoutsLogged: number; // The value for your X-axis (bar length)
}

interface ClientPlanSummary {
  name: string;
  value: number;
  color: string;
} 

interface DueSoon {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  daysUntilExpiration: number;
}

const CoachDashboard: React.FC = () => {
  const t = useTranslations();
  const tWeekday = useTranslations('weekdays');
  const searchParams = useSearchParams();
  const [clientsDueToday, setClientsDueToday] = useState<IClient[]>([]);
  const [areCoachClients, setAreCoachClients] = useState<IClient[]>([]);
  const [dueSoon, setDueSoon] = useState<DueSoon[]>([]);
  const [expiredPlans, setExpiredPlans] = useState<DueSoon[]>([]);
  const [userName, setUserName] = useState('Coach');
  const [profilePic, setProfilePic] = useState('/globe.svg');
  const [isLoading, setIsLoading] = useState(true);
  const [todayDate, setTodayDate] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coachId, setCoachId] = useState<Types.ObjectId | null>(null);
  const [coach, setCoach] = useState<ICoach | null>(null);
  const [workoutLogs, setLocalWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [viewClientId, setViewClientId] = useState<string | null>(null); // Changed to string for _id compatibility
  const [dueSoonClientId, setDueSoonClientId] = useState<string | null>(null); 
  const [clientDetails, setClientDetails] = useState<IClient | null>(null); // Changed to single client object
  const [dueSoonClientDetails, setDueSoonClientDetails] = useState<IClient | null>(null);
  const [chartData, setChartData] = useState<ClientWorkoutSummary[]>([]);
  const [membershipClients, setMembershipClients] = useState<ClientPlanSummary[]>([])
  const [isDueSoonModalOpen, setIsDueSoonModalOpen] = useState(false);

  const WhatsAppLogo = '/WhatsAppLogo.png';
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('id');
      if (id) {
        try {
          setCoachId(new Types.ObjectId(id));
        } catch (err) {
          console.error('Invalid coach ID:', err);
          setError(t('invalidCoachId'));
          setIsLoading(false);
        }
      } else {
        console.error('No coach ID in localStorage');
        setError(t('noCoachId'));
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('openModalAfterWorkout')) {
      setIsModalOpen(true);
      localStorage.removeItem('openModalAfterWorkout');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [coachId]);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const localCoachId = localStorage.getItem('id');

    if (!token || !localCoachId) {
      console.error('Missing token or coach ID:', { token, localCoachId });
      setError(t('notAuthenticated'));
      setIsLoading(false);
      return;
    }

    try {
      // Fetch clients
      const clientsRes = await fetch('/api/client', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!clientsRes.ok) {
        const errorData = await clientsRes.text();
        console.error('Clients fetch error:', errorData, 'Status:', clientsRes.status);
        throw new Error(t('failedToFetchClients', { error: errorData || clientsRes.statusText }));
      }
      const allClients: IClient[] = await clientsRes.json();
      const coachClients = allClients.filter(
        (client) => client.coach._id?.toString() === localCoachId
      );
      setAreCoachClients(coachClients);
      console.log('Coach clients:', coachClients);

      // Fetch coach profile
      const profileRes = await fetch(`/api/coaches/${localCoachId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileRes.ok) {
        const errorData = await profileRes.text();
        console.error('Profile fetch error:', errorData, 'Status:', profileRes.status);
        setError(t('failedToFetchProfile', { error: errorData || profileRes.statusText }));
        setIsLoading(false);
        return;
      }
      const profile = await profileRes.json();
      setCoach(profile);
      setUserName(profile.name || 'Coach');
      const clientPlans = profile.plans || []; // Ensure clientPlans is an array
      console.log('Client plans:', clientPlans); // Debug: Check plans

      // Client Membership Pie Chart Data
      const membershipData = [
        ...clientPlans.map((plan: string) => ({
          name: plan || t('unknownPlan'),
          value: coachClients.filter((client) => client.planAssigned === plan).length,
          color: ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][clientPlans.indexOf(plan) % 5] || '#F97316',
        })),
        {
          name: t('otherPlan'),
          value: coachClients.filter((client) => 
            !client.planAssigned || 
            client.planAssigned === '' || 
            !clientPlans.includes(client.planAssigned || '')
          ).length,
          color: '#D1D5DB', // Gray color for "No Plan" (includes unassigned and outdated plans)
        },
      ];
      console.log('Membership data:', membershipData); // Debug: Check membership data
      setMembershipClients(membershipData);

      //TODAY'S DATE
      setTodayDate(new Date().toLocaleString(t('locale'), { weekday: 'long', month: 'long', day: 'numeric' }));
      const today = new Date().toLocaleString('en-US', { weekday: 'long' });

      // Filter clients due today
      const dueToday = coachClients.filter((client): client is IClient => {
        const schedule = client.workoutSchedule as IWorkoutSchedule;
        if (!schedule?.schedule) {
          console.error('No schedule found for client:', client._id);
          return false;
        }
        return schedule.schedule.some((s) => s.weekDay === today);
      });
      setClientsDueToday(dueToday);

      // Fetch workout logs
      const logsRes = await fetch('/api/workoutLog', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!logsRes.ok) {
        const errorData = await logsRes.text();
        console.error('Logs fetch error:', errorData, 'Status:', logsRes.status);
        throw new Error(t('failedToFetchLogs', { error: errorData || logsRes.statusText }));
      }
      const logs: WorkoutLog[] = await logsRes.json();
      setLocalWorkoutLogs(logs);

      //Client Logs Chart Data
      const realChartData = coachClients.map((client) => ({
        clientId: client._id?.toString() || '',
        clientName: `${client.firstName} ${client.lastName}`,
        workoutsLogged: logs.filter((log) => log.client._id?.toString() === client._id?.toString()).length,
      }));
      setChartData(realChartData);

      // Calculate due soon
      const dueSoonData = coachClients
        .map((client): DueSoon | null => {
          if (!client.planExpires) return null;
          const expirationDate = new Date(client.planExpires);
          const daysUntilExpiration = Math.ceil(
            (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntilExpiration <= 7 && daysUntilExpiration >= 0) {
            return {
              _id: client._id ? client._id.toString() : Math.random().toString(),
              firstName: client.firstName,
              lastName: client.lastName,
              imageUrl: client.imageUrl,
              daysUntilExpiration,
            };
          }
          return null;
        })
        .filter((d): d is DueSoon => d !== null);
      setDueSoon(dueSoonData);

      const expiredMemberships = coachClients.map((client): DueSoon | null => {
        if(!client.planExpires) return null; 
        const expirationDate = new Date(client.planExpires);
        const daysUntilExpiration = Math.ceil(
          (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if(daysUntilExpiration < 0) {
          return {
            _id: client._id ? client._id.toString() : Math.random().toString(),
            firstName: client.firstName,
            lastName: client.lastName,
            imageUrl: client.imageUrl,
            daysUntilExpiration,
          };
        }
        return null;
      })
      .filter((d): d is DueSoon => d !== null);
      setExpiredPlans(expiredMemberships);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("genericError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    if (viewClientId) {
      const selectedClient = clientsDueToday.find((client) => client._id?.toString() === viewClientId);
      setClientDetails(selectedClient || null);
    }
  }, [viewClientId, clientsDueToday]);

  useEffect(() => {
    if (dueSoonClientId) {
      const selectedDueSoonClient = areCoachClients.find((client) => client._id?.toString() === dueSoonClientId);
      setDueSoonClientDetails(selectedDueSoonClient || null);
    }
  }, [dueSoonClientId, areCoachClients]);

  // const handleUpgrade = async () => {
  //   const res = await fetch('/api/create-checkout-session', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       email: user.email,
  //       priceId: 'price_id_for_your_plan',
  //     }),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });

  //   const { sessionId } = await res.json();
  //   const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  //   await stripe?.redirectToCheckout({ sessionId });
  // };



  const clientDetailsSchedule = clientDetails?.workoutSchedule as IWorkoutSchedule;

  if (!coachId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('authenticationRequired')}</h2>
            <p className="text-gray-600">{t('loginToAccess')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="absolute left-20 right-0 xl:right-80 md:right-72 p-6 pb-8">
        {coach && !coach.isSubscribed && areCoachClients.length >= 3 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-yellow-800 font-semibold">
                You’ve reached the free client limit. Upgrade to manage more clients.
              </p>
              <button
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md"
                // onClick={() => handleUpgrade()}
              >
                Upgrade Now
              </button>
            </div>
          )}
        {/* Header */}
        <div className="mb-8 flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {/* COACH PROFILE IMAGE */}

              {/* <Image
                src={profilePic}
                alt={t('profileAlt')}
                width={64}
                height={64}
                className="rounded-full border-4 border-slate-100 shadow-sm"
              /> */}
              <div className="w-14 h-14 text-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {userName.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('welcome')}, {userName}</h1>
              <p className="text-sm text-gray-500">{t('welcomeBack')}</p>
            </div>
          </div>

          {/* ADD CLIENT BUTTON */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700
             text-white cursor-pointer font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addClient')}
          </button>
        </div>
        
        <AddClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onClientAdded={fetchData}
          coachId={coachId}
          coach={coach}
        />

        {/* Today's Workouts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{t('todayWorkouts')}</h2>
                <p className="text-sm text-gray-500">{todayDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {t("scheduled", {due: clientsDueToday.length})}
            </div>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">{t('loadingWorkouts')}</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-red-200">
              <div className="flex items-center justify-center text-red-600">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('plan')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('gender')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('goal')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('weight')}</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {clientsDueToday.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noWorkoutsScheduled')}</h3>
                            <p className="text-gray-500">{t('noWorkoutsMessage')}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      clientsDueToday.map((client) => (
                        <tr key={client._id?.toString()} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative">
                                {/* <Image
                                  src={profilePic}
                                  alt={t('clientProfileAlt')}
                                  width={40}
                                  height={40}
                                  className="rounded-full border-2 border-slate-100"
                                /> */}
                                <div className="w-12 h-12 text-xl bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{`${client.firstName} ${client.lastName}`}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {client.planAssigned}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {client.goal}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.currentWeight}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 font-medium cursor-pointer"
                              onClick={() => {
                                setViewDetailsModal(true)
                                setViewClientId(client._id.toString())
                              }}
                            >
                              {t('viewDetails')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {viewDetailsModal && clientDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-150 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {clientDetails?.firstName} {clientDetails?.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">{t('clientDetails')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDetailsModal(false)}
                    className="group w-10 h-10 bg-white rounded-xl shadow-sm border cursor-pointer border-slate-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {t('contactInformation')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50/50 rounded-xl p-4 border border-slate-200 hover:bg-green-50 hover:shadow-md/5">
                      <Link
                        href={`https://wa.me/${clientDetails?.phone.replace(/[^0-9]/g, '')}`}
                        target='_blank'
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Image src={WhatsAppLogo} alt={t('whatsAppLogoAlt')} width={20} height={20}/>
                          </div>
                          <div>
                            <p className="text-sm text-green-500 font-medium">{t('messageOnWhatsApp')}</p>                        
                            <p className="text-gray-800 font-semibold">{clientDetails?.phone}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="bg-purple-50/50 rounded-xl p-4 border border-slate-200 hover:bg-purple-50 hover:shadow-md/5">
                      <Link href={`mailto:${clientDetails?.email}?body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0ASent%20from%20SimpleFit%20CMS`} target='_blank'>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">{t('email')}</p>
                            <p className="text-gray-800 font-semibold">{clientDetails?.email}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Today's Workouts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    {t('todayWorkouts')}
                  </h3>
                  
                  {clientDetailsSchedule?.schedule
                    .filter((s) => s.weekDay === today)
                    .flatMap((s) => s.workouts)
                    .length > 0 ? (
                    <div className="space-y-4">
                      {clientDetailsSchedule?.schedule
                        .filter((s) => s.weekDay === today)
                        .flatMap((s) => s.workouts)
                        .map((workout, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-2">{workout.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    {workout.sets} {t('sets')}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {workout.reps} {t('reps')}
                                  </span>
                                  {workout.targetWeight && (
                                    <span className="inline-flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
                                      </svg>
                                      {workout.targetWeight}
                                    </span>
                                  )}
                                </div>
                                {workout.comment && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                                    <p className="text-sm text-amber-800 italic flex items-start gap-2">
                                      <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                      </svg>
                                      {workout.comment}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('workoutNumber')} {index + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-slate-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{t('noWorkoutsScheduled')}</h4>
                      <p className="text-gray-500">{t('noWorkoutsToday')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
          {/* Progress Chart */}
          <PieChartAllClients data={membershipClients} coachClients={areCoachClients}/>

          {/* Total Logs and Due Soon */}
          <div className="w-full lg:w-2/3">
            <div className="flex flex-col justify-between space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
              {/* Total Logs */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{t('clientLogs')}</h2>
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="overflow-y-auto rounded-xl">
                    <TotalLogsByClientChart data={chartData} />
                  </div>
                </div>
              </div>
              
              {/* Due Soon */}
              <div className="w-full lg:w-1/2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{t('requireAttention')}</h2>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {dueSoon.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                      </div>
                    ) : dueSoon.length === 0 && expiredPlans.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">{t('allCurrent')}</p>
                        <p className="text-sm text-gray-400">{t('noExpirationsSoon')}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 cursor-pointer">
                        {dueSoon.map((due) => (
                          <div 
                            key={due._id} 
                            onClick={() => {
                              setIsDueSoonModalOpen(true);
                              setDueSoonClientId(due._id.toString())
                            }}
                            className="p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                {/* <Image
                                  src={due.imageUrl || profilePic}
                                  alt={t('clientProfileAlt')}
                                  width={32}
                                  height={32}
                                  className="rounded-full border-2 border-slate-100"
                                /> */}
                                <div className="w-10 h-10 text-lg bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                  {due.firstName.charAt(0)}{due.lastName.charAt(0)}
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-md font-medium text-gray-900">{`${due.firstName} ${due.lastName}`}</p>
                                <p className="text-sm text-orange-600 font-medium">{t('expiresIn', { days: due.daysUntilExpiration })}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {expiredPlans.map((expired) => (
                          <div 
                            key={expired._id} 
                            onClick={() => {
                              setIsDueSoonModalOpen(true);
                              setDueSoonClientId(expired._id.toString())
                            }}
                            className="p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                {/* <Image
                                  src={expired.imageUrl || profilePic}
                                  alt={t('clientProfileAlt')}
                                  width={32}
                                  height={32}
                                  className="rounded-full border-2 border-slate-100"
                                /> */}
                                <div className="w-10 h-10 text-lg bg-gradient-to-r from-indigo-500/65 to-indigo-600/50 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                  {expired.firstName.charAt(0)}{expired.lastName.charAt(0)}
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-md font-medium text-gray-400 line-through">{`${expired.firstName} ${expired.lastName}`}</p>
                                <p className="text-sm text-gray-400 font-semibold">{t('membershipExpired')}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {isDueSoonModalOpen && dueSoonClientId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {dueSoonClientDetails?.firstName} {dueSoonClientDetails?.lastName}
                      </h2>
                      <p className="text-sm text-gray-500">{t('membershipNeedsAttention')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDueSoonModalOpen(false)}
                    className="group w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">   
                {/* Membership Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {t('membershipDetails')}
                  </h3>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-red-600 font-medium">{t('membershipExpires')}</p>
                        <p className="text-red-800 font-semibold text-lg">
                          {dueSoonClientDetails?.planExpires?.toString().split('T')[0] || t('dateNotAvailable')}
                        </p>
                      </div>
                    </div>
                    <div className="bg-red-100 rounded-lg p-3 mt-3">
                      <p className="text-sm text-red-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('contactForRenewal')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    {t('contactInformation')}
                  </h3>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <Link 
                      href={`https://wa.me/${dueSoonClientDetails?.phone.replace(/[^0-9]/g, '')}`}
                      target='_blank'
                    >
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:bg-green-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Image src={WhatsAppLogo} alt={t('whatsAppLogoAlt')} width={20} height={20}/>
                          </div>
                          <div>
                            <p className="text-sm text-green-500 font-medium">{t('messageOnWhatsApp')}</p>
                            <p className="text-gray-800 font-semibold">{dueSoonClientDetails?.phone}</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* User Email */}
                    <Link 
                      href={`mailto:${dueSoonClientDetails?.email}?body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A%0D%0ASent%20from%20SimpleFit%20CMS`} 
                      target='_blank'
                    >
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:bg-purple-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">{t('email')}</p>
                            <p className="text-gray-800 font-semibold">{dueSoonClientDetails?.email}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notifications Sidebar */}
        <nav className="fixed right-0 top-0 bottom-0 bg-[#1f2d3d] shadow-xl/30 flex flex-col xl:w-80 md:w-72 z-10">
          <div className="p-6 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a1.5 1.5 0 010-2.12L20 8h-5m-5 9H5l3.5-3.5a1.5 1.5 0 000-2.12L5 8h5m0 0V3m0 5v10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t('notifications')}</h2>
                  <p className="text-sm text-gray-400">{t('recentActivity')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">{workoutLogs.length}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                <p className="text-gray-400">{t('loadingNotifications')}</p>
              </div>
            ) : workoutLogs.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">{t('allCaughtUp')}</h3>
                <p className="text-gray-500">{t('noNewNotifications')}</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {workoutLogs.map((log) => (
                  <div
                    key={log._id}
                    className="group relative bg-gradient-to-r bg-[#324d6c] rounded-xl p-3 
                    transition-all duration-200 border border-slate-600 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                          {log.client.firstName.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {`${log.client.firstName} ${log.client.lastName}`}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date(log.loggedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                          {t('completedWorkoutOn')} <span className="font-semibold text-orange-400">{tWeekday(log.day)}</span>
                        </p>
                        {log.comment && (
                          <div className="bg-white rounded-lg p-1 mb-1">
                            <p className="text-xs text-gray-600 italic">
                              &quot;{log.comment}&quot;
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-300">
                            {new Date(log.loggedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">{t('completed')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notification indicator */}
                    <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-600">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{t('lastUpdated')}</span>
              <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
    );
};

export default CoachDashboard;