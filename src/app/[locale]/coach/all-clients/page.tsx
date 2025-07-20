'use client';

/* -------------------------------------------------------------------------- */
/*                               All-ClientsPage                                 */
/* -------------------------------------------------------------------------- */

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import LeftSideNav from '@/app/components/LeftSideNav';
import { IClient } from '../../../../../lib/models/clients';
import { ICoach } from '../../../../../lib/models/coach';
import ViewClientDetailsModal from '@/app/components/coach-dashboard/ViewClientDetailsModal';

type SortField = 'name' | 'email' | 'phone' | 'goal' | 'planAssigned' | 'planExpires';
type SortDirection = 'asc' | 'desc';

const ClientsPage: React.FC = () => {
  const t = useTranslations();
  const [clients, setClients] = useState<IClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<ICoach | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  /* ------------------------------- Fetch Data ------------------------------ */
  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error(t('noAuthToken'));

      const response = await fetch('/api/client', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(t('fetchError'));
      const data: IClient[] = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("genericError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleRefreshingPage = () => fetchClients();

  /* ------------------------------ Search & Filter ----------------------------- */
  useEffect(() => {
    let filtered = clients.filter(client =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.planAssigned.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'phone':
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 'goal':
          aValue = a.goal;
          bValue = b.goal;
          break;
        case 'planAssigned':
          aValue = a.planAssigned;
          bValue = b.planAssigned;
          break;
        case 'planExpires':
          aValue = a.planExpires ? new Date(a.planExpires) : new Date(0);
          bValue = b.planExpires ? new Date(b.planExpires) : new Date(0);
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (sortField === 'planExpires') {
        const result = (aValue as Date).getTime() - (bValue as Date).getTime();
        return sortDirection === 'asc' ? result : -result;
      }

      const result = (aValue as string).localeCompare(bValue as string);
      return sortDirection === 'asc' ? result : -result;
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, sortField, sortDirection]);

  /* ------------------------------ Sorting Handler ----------------------------- */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /* ------------------------------ Current Date ----------------------------- */
  const currentDate = new Date(); // EDT offset
  const formattedDate = currentDate.toLocaleString(t("locale"), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getExpirationStatus = (expireDate: string | undefined) => {
    if (!expireDate) return 'none';
    
    const today = new Date();
    const expire = new Date(expireDate);
    const daysDiff = Math.ceil((expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 7) return 'expiring';
    return 'active';
  };

  const getExpirationBadge = (expireDate: string | undefined) => {
    const status = getExpirationStatus(expireDate);
    
    switch (status) {
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t('expired')}
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {t('expiringSoon')}
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t('active')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {t('noExpireDate')}
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <LeftSideNav />

      {/* Main Content */}
      <main className="flex-1 ml-20 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className='flex gap-2'>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t("clientsList")}
              </h1>
              <p className="flex items-center text-sm text-gray-500"> - {formattedDate}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {filteredClients.length} {t('totalClients')}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleRefreshingPage}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('refresh')}
              </button>
            </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{t("loading")}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-red-200">
            <div className="flex items-center justify-center text-red-600">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredClients.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noClientsFound')}</h3>
              <p className="text-gray-500">{t('noClientsDescription')}</p>
            </div>
          </div>
        )}

        {/* Clients Table */}
        {!loading && !error && filteredClients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr>
                    {[
                      { key: 'name', label: t('name') },
                      { key: 'email', label: t('email') },
                      { key: 'phone', label: t('phone') },
                      { key: 'goal', label: t('goal') },
                      { key: 'planAssigned', label: t('planAssigned') },
                      { key: 'planExpires', label: t('membershipExpires') },
                    ].map((header) => (
                      <th
                        key={header.key}
                        onClick={() => handleSort(header.key as SortField)}
                        className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-blue-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {header.label}
                          {getSortIcon(header.key as SortField)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredClients.map((client) => (
                    <tr
                      key={client._id?.toString()}
                      onClick={() => {
                        setIsModalOpen(true);
                        setSelectedClient(client);
                        setSelectedCoach((client.coach as ICoach) || null);
                      }}
                      className="cursor-pointer transition-colors hover:bg-slate-50 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {`${client.firstName} ${client.lastName}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {client.goal}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {client.planAssigned}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getExpirationBadge(client.planExpires?.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <ViewClientDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          client={selectedClient}
          coach={selectedCoach}
          onPageRefresh={handleRefreshingPage}
        />
      </main>
    </div>
  );
};

export default ClientsPage;