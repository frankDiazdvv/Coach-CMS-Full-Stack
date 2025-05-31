'use client';

import { useEffect, useState } from 'react';
import { IClient } from '../../../lib/models/clients';
import { Types } from 'mongoose'; // Remove Schema
import router from 'next/router';
import Link from 'next/link';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
  coachId: Types.ObjectId; // Use Types.ObjectId
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onClientAdded, coachId }) => {
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
    workoutSchedule: undefined,
    nutritionSchedule: undefined,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  //Gets Workout Schedule from localStorage from AddWorkoutPage
  useEffect(() => {
    const tempWorkoutSchedule = localStorage.getItem('workoutSchedule');
    const storedFormData = localStorage.getItem('clientFormData');
    if (storedFormData) {
      setFormData(JSON.parse(storedFormData));
    }
    if (tempWorkoutSchedule) {
      setFormData((prev) => ({
        ...prev,
        workoutSchedule: JSON.parse(tempWorkoutSchedule) as any,
      }));
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


      if (!response.ok) {
        let errorMessage = 'Failed to create client';
        errorMessage = response.statusText || errorMessage;
        throw new Error(errorMessage);
      }

      alert(JSON.stringify(formData));

      localStorage.removeItem('workoutSchedule');
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

  const handleAddWorkout = () => {
    localStorage.setItem('clientFormData', JSON.stringify(formData));
  };

  const handleCancel = () => {
    localStorage.removeItem('workoutSchedule');
    localStorage.removeItem('clientFormData');
    clearFormData();
    onClose(); // Call the prop to close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
      <div className=" w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Add New Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='flex flex-row'>
            <div className='first-name-container'>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
            </div>
            <div className='last-name-container'>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-input"
                />
            </div>
          </div>
          <div className='email-container'>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className='password-container'>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className='phone-container'>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className='flex flex-row'>
            <div className='gender-container'>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="form-input"
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            <div className='goal-container'>
                <label className="block text-sm font-medium text-gray-700">Goal</label>
                <input
                    type="text"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
          </div>
          <div className='flex flex-row'>
            <div className='current-weight-container'>
                <label className="block text-sm font-medium text-gray-700">Current Weight</label>
                <input
                    type="text"
                    name="currentWeight"
                    value={formData.currentWeight}
                    onChange={handleChange}
                    required
                    className="form-input"
                />
            </div>
            <div className='target-weight-container'>
                <label className="block text-sm font-medium text-gray-700">Target Weight</label>
                <input
                    type="text"
                    name="targetWeight"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>
          </div>
          <div className='flex flex-row'>
            <div className='plan-assigned-container'>
                <label className="block text-sm font-medium text-gray-700">Plan Assigned</label>
                <input
                type="text"
                name="planAssigned"
                value={formData.planAssigned}
                onChange={handleChange}
                required
                className="form-input"
                />
            </div>
            <div className='plan-expires-container'>
                <label className="block text-sm font-medium text-gray-700">Plan Expires</label>
                <input
                type="date"
                name="planExpires"
                value={
                  formData.planExpires
                    ? new Date(formData.planExpires).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => setFormData({ ...formData, planExpires: e.target.value ? new Date(e.target.value) : undefined })}
                className="form-input"
                />
            </div>
          </div>
          <div className='image-url-container'>
            <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-between">
            <Link href='./add-workout'
              className="rounded-md bg-green-400 px-4 py-2 text-white cursor-pointer"
              onClick={handleAddWorkout}
            >
              Add Workout
            </Link>
            <button
              type="button"
              className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 opacity-50 cursor-not-allowed"
            >
              Add Nutrition Plan
            </button>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating...' : 'Create Client'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;