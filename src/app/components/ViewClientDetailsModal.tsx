'use client';

import { useState, useEffect } from 'react';
import { IClient } from '../../../lib/models/clients';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ViewClientDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  client: IClient | null;
}

const ViewClientDetailsModal: React.FC<ViewClientDetailsProps> = ({ isOpen, onClose, client }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IClient>>({});
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
        planExpires: formData.planExpires,
        imageUrl: client.imageUrl || '',
      });
      setIsLoading(false);
    }
  }, [isOpen, client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!client?._id) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/client/${client._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update client');
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToWorkout = () => {
    if (client?.workoutSchedule) {
      localStorage.setItem('workoutSchedule', JSON.stringify(client.workoutSchedule));
    }
    router.push('/client-side/add-workout');
  };

  const navigateToNutrition = () => {
    if (client?.nutritionSchedule) {
      localStorage.setItem('nutritionSchedule', JSON.stringify(client.nutritionSchedule));
    }
    router.push('/client-side/add-nutrition');
  };

  if (!isOpen || !client) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Client Details</h2>
        {isLoading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div className="space-y-4">
            <div className='flex flex-row gap-4'>
                <div className='first-name-input'>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                </div>
                <div className='last-name-input'>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                </div>
            </div>
            
            <div className='flex flex-row gap-4'>
                <div className='email-input'>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div className='phone-input'>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>
            
            <div className='flex flex-row gap-4'>
                <div className='gender-input'>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className='goal-input'>
                    <label className="block text-sm font-medium text-gray-700">Goal</label>
                    <input
                        type="text"
                        name="goal"
                        value={formData.goal || ''}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>
           
           <div className='flex flex-row gap-4'>
                <div className='curr-weight-input'>
                    <label className="block text-sm font-medium text-gray-700">Current Weight</label>
                    <input
                    type="string"
                    name="currentWeight"
                    value={formData.currentWeight || ''}
                    placeholder='180lb, 65kg'
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    />
                </div>
                <div className='target-weight-input'>
                    <label className="block text-sm font-medium text-gray-700">Target Weight (lbs)</label>
                    <input
                    type="string"
                    name="targetWeight"
                    value={formData.targetWeight || ''}
                    onChange={handleChange}
                    placeholder='180lb, 85kg'
                    className="w-full p-2 border rounded"
                    />
                </div>
           </div>
            
            <div className='flex flex-row gap-4'>
                <div className='plan-assigned-input'>
                <label className="block text-sm font-medium text-gray-700">Plan Assigned</label>
                <input
                    type="text"
                    name="planAssigned"
                    value={formData.planAssigned || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                </div>
                <div className='plan-expires-input'>
                <label className="block text-sm font-medium text-gray-700">Plan Expires</label>
                <input
                    type="date"
                    name="planExpires"
                    value={formData.planExpires
                    ? new Date(formData.planExpires).toISOString().split('T')[0]
                    : ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                </div>
            </div>
            
            <div className='image-url-input'>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex flex-row gap-4">
              <button
                onClick={navigateToWorkout}
                className="bg-red-600 rounded p-2 text-white hover:bg-red-700"
              >
                Edit Workout Plan
              </button>
              <button
                onClick={navigateToNutrition}
                className="bg-green-600 rounded p-2 text-white hover:bg-green-700"
              >
                Edit Nutrition Plan
              </button>
            </div>
            <button
              onClick={handleSave}
              className="mt-4 bg-[#234459] text-white py-2 px-4 rounded hover:bg-[#1a3344] transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-2 bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ViewClientDetailsModal;