'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { IClient } from '../../../../lib/models/clients';
import { ICoach } from '../../../../lib/models/coach';
import { useRouter } from 'next/navigation';
import { Types } from 'mongoose';

interface ViewClientDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  client: IClient | null;
  coach: ICoach | null;
  onPageRefresh: () => void;
}

const ViewClientDetailsModal: React.FC<ViewClientDetailsProps> = ({ isOpen, onClose, client, coach, onPageRefresh }) => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IClient>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    goal: '',
    currentWeight: '',
    targetWeight: '',
    planAssigned: '',
    planExpires: undefined,
    imageUrl: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (isOpen && client) {
      setIsLoading(true);
      setError(null);
      setFormData({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        gender: client.gender || '',
        goal: client.goal || '',
        currentWeight: client.currentWeight || '',
        targetWeight: client.targetWeight || '',
        planAssigned: client.planAssigned || '',
        planExpires: client.planExpires ? new Date(client.planExpires) : undefined,
        imageUrl: client.imageUrl || '',
      });
      setIsLoading(false);
    }
  }, [isOpen, client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'planExpires') {
      setFormData((prev) => ({ ...prev, [name]: value ? new Date(value) : undefined }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!client?._id) {
      setError(t('clientNotFound'));
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error(t('noAuthToken'));

      const clientId = client._id.toString();
      const response = await fetch(`/api/client/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(t('failedToUpdateClient'));
      }
      onClose();
      if (onPageRefresh) onPageRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("genericError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t('deleteClientConfirm'))) {
      if (!client?._id) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error(t('noAuthToken'));

        const clientId = client._id.toString();
        const response = await fetch(`/api/client/${clientId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(t('failedToDeleteClient'));
        }
        onClose();
        if (onPageRefresh) onPageRefresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("genericError");
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const navigateToWorkout = () => {
    if (client) {
      let workoutScheduleId: string | null = null;

      if (client.workoutSchedule) {
        if (client.workoutSchedule instanceof Types.ObjectId) {
          workoutScheduleId = client.workoutSchedule.toString();
        } else if (typeof client.workoutSchedule === 'object' && '_id' in client.workoutSchedule) {
          workoutScheduleId = client.workoutSchedule._id as any;
        }
      }

      if (workoutScheduleId) {
        localStorage.setItem('workoutScheduleId', workoutScheduleId);
        localStorage.setItem('userFirstName', client.firstName || '');
        localStorage.setItem('userLastName', client.lastName || '');
      } else {
        localStorage.setItem('clientFormData', JSON.stringify(formData));
      }

      router.push('/coach/add-workout');
    }
  };

  const navigateToNutrition = () => {
    if (client?.nutritionSchedule) {
      localStorage.setItem('nutritionScheduleId', client.nutritionSchedule.toString());
      localStorage.setItem('userFirstName', client.firstName.toString() || '');
      localStorage.setItem('userLastName', client.lastName.toString() || '');
    } else {
      localStorage.setItem('clientFormData', JSON.stringify(formData));
    }
    router.push('/coach/add-nutrition');
  };

  const handleCancel = () => {
    localStorage.removeItem('clientFormData');
    onClose();
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('editClientDetails')}</h2>
                <p className="text-blue-100 text-sm">{t('updateClientInformation')}</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                {t('quickActions')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <button
                  onClick={navigateToWorkout}
                  className="flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  {t('editWorkoutPlan')}
                </button>
                <button
                  onClick={navigateToNutrition}
                  className="flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  {t('editNutritionPlan')}
                </button>
              </div>
            </div>
            
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {t('personalInformation')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('enterFirstName')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('enterLastName')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('enterPhone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newPassword')} ({t('optional')})
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    autoComplete='new-password'
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('typeNewPassword')}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  autoComplete='client@email.com'
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder={t('enterEmail')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('gender')}</label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="">{t('selectGender')}</option>
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('goal')}</label>
                  <input
                    type="text"
                    name="goal"
                    value={formData.goal || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('enterGoal')}
                  />
                </div>
              </div>
            </div>

            {/* Fitness Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                {t('fitnessInformation')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('currentWeight')}</label>
                  <input
                    type="text"
                    name="currentWeight"
                    value={formData.currentWeight || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('weightPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('targetWeight')}</label>
                  <input
                    type="text"
                    name="targetWeight"
                    value={formData.targetWeight || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder={t('targetWeightPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('planAssigned')}</label>
                  <select
                    name="planAssigned"
                    value={formData.planAssigned || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="">{t('selectPlan')}</option>
                    {coach?.plans.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('planExpires')}</label>
                  <input
                    type="date"
                    name="planExpires"
                    value={formData.planExpires ? formData.planExpires.toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('imageUrl')}</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder={t('enterImageUrl')}
                />
              </div>
            </div>

            
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {t('saveChanges')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('deleteUser')}
              </button>
            </div>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClientDetailsModal;