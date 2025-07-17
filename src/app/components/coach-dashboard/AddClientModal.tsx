'use client';

import { useEffect, useState } from 'react';
import { IClient } from '../../../../lib/models/clients';
import { ICoach } from '../../../../lib/models/coach';
import { Types } from 'mongoose'; // Remove Schema
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
  coachId: Types.ObjectId; // Use Types.ObjectId
  coach: ICoach | null;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onClientAdded, coachId, coach }) => {
  const [formData, setFormData] = useState<Partial<IClient>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    goal: '',
    currentWeight: '',
    targetWeight: '',
    planAssigned: '',
    imageUrl: '',
    planExpires: undefined,
    coach: coachId,
    workoutSchedule: { schedule: [] } as any,
    nutritionSchedule: { schedule: [] } as any,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();


  //Gets Workout/Nutrition Schedule from localStorage from AddWorkoutPage/AddNutritionPage
  useEffect(() => {
    const storedFormData = localStorage.getItem('clientFormData');
    const storedWorkoutSchedule = localStorage.getItem('workoutSchedule');
    const storedNutritionSchedule = localStorage.getItem('nutritionSchedule');

    if (storedFormData) {
      const parsedData = JSON.parse(storedFormData);
      const parsedWorkoutSchedule = storedWorkoutSchedule ? JSON.parse(storedWorkoutSchedule) : [];
      const parsedNutritionSchedule = storedNutritionSchedule ? JSON.parse(storedNutritionSchedule) : [];

      setFormData({
        ...parsedData,
        workoutSchedule: { schedule: Array.isArray(parsedWorkoutSchedule) ? parsedWorkoutSchedule : [parsedWorkoutSchedule] },
        nutritionSchedule: { schedule: Array.isArray(parsedNutritionSchedule) ? parsedNutritionSchedule : [parsedNutritionSchedule] },
      });
    }    
  }, [isOpen]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFormData = () => {
    setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        gender: '',
        goal: '',
        currentWeight: '',
        targetWeight: '',
        planAssigned: '',
        imageUrl: '',
        planExpires: undefined,
        coach: coachId,
      });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');
      const response = await fetch('/api/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // Removed alert as per instructions to avoid window.alert()
      // alert(JSON.stringify(formData));


      if (!response.ok) {
        let errorMessage = 'Failed to create client';
        errorMessage = response.statusText || errorMessage;
        throw new Error(errorMessage);
      }


      localStorage.removeItem('workoutSchedule');
      localStorage.removeItem('nutritionSchedule');
      localStorage.removeItem('clientFormData');

      clearFormData();

      onClientAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedules = () => {
    localStorage.setItem('clientFormData', JSON.stringify(formData));
  };

  const handleCancel = () => {
    localStorage.removeItem('workoutSchedule');
    localStorage.removeItem('nutritionSchedule');
    localStorage.removeItem('clientFormData');
    clearFormData();
    onClose(); // Call the prop to close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-scroll">
     <div className=" w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
        <h2 className="mb-5 text-2xl font-bold text-gray-800 text-center">{t("addNewClientHeader")}</h2>
        <form onSubmit={handleSubmit} className="h-full overflow-y-auto">
          <div className="space-y-4">
            {/* Personal Info Row */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-gray-600 mb-1">{t("firstName")}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-gray-600 mb-1">{t("lastName")}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-xs font-medium text-gray-600 mb-1">{t("gender")}</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select</option>
                  <option value="Male">{t("male")}</option>
                  <option value="Female">{t("female")}</option>
                </select>
              </div>
            </div>

            {/* Contact Info Row */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">{t("email")}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">{t("phone")}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="123-456-7890"
                />
              </div>
            </div>

            {/* Security Row */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">{t("password")}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="goal" className="block text-xs font-medium text-gray-600 mb-1">{t("goal")}</label>
                <input
                  type="text"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder={t("goalPlaceholder")}
                />
              </div>
            </div>

            {/* Weight & Plan Row */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
              <div>
                <label htmlFor="currentWeight" className="block text-xs font-medium text-gray-600 mb-1">{t("currentWeight")}</label>
                <input
                  type="text"
                  id="currentWeight"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="150 lbs"
                />
              </div>
              <div>
                <label htmlFor="targetWeight" className="block text-xs font-medium text-gray-600 mb-1">{t("targetWeight")}</label>
                <input
                  type="text"
                  id="targetWeight"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                  placeholder="140 lbs"
                />
              </div>
              <div>
                <label htmlFor="planAssigned" className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                <select
                  id="planAssigned"
                  name="planAssigned"
                  value={formData.planAssigned}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="" disabled>{t("selectPlan")}</option>
                  {coach?.plans.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="planExpires" className="block text-xs font-medium text-gray-600 mb-1">{t("expires")}</label>
                <input
                  type="date"
                  id="planExpires"
                  name="planExpires"
                  value={
                    formData.planExpires
                      ? new Date(formData.planExpires).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    planExpires: e.target.value.toString() ? new Date(e.target.value.toString()) : undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label htmlFor="imageUrl" className="block text-xs font-medium text-gray-600 mb-1">Profile Image URL <span className="text-gray-400">({t("optional")})</span></label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder={t("featureComingSoon")}
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">{error}</p>}
            
            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Link href='./add-workout'
                className="flex-1 text-center text-sm rounded-md bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition-colors"
                onClick={handleAddSchedules}
              >
                {t("addWorkout")}
              </Link>
              <Link href='./add-nutrition'
                className="flex-1 text-center text-sm rounded-md bg-green-500 px-4 py-2 text-white font-medium hover:bg-green-600 transition-colors"
                onClick={handleAddSchedules}
              >
                {t("addNutrition")}
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-md transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isLoading ? 'Creating...' : t('createClient')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;
