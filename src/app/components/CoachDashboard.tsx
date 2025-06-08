'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IClient } from '../../../lib/models/clients';
import { IWorkoutSchedule } from '../../../lib/models/workouts';
import AddClientModal from './AddClientModal';
import { Types } from 'mongoose';
import { useSearchParams } from 'next/navigation';

interface Warning {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  missedSessions: number;
}

interface DueSoon {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  daysUntilExpiration: number;
}

const CoachDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const [clientsDueToday, setClientsDueToday] = useState<IClient[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [dueSoon, setDueSoon] = useState<DueSoon[]>([]);
  const [userName, setUserName] = useState('Coach');
  const [profilePic, setProfilePic] = useState('/globe.svg');
  const [isLoading, setIsLoading] = useState(true);
  const [todayDate, setTodayDate] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coachId, setCoachId] = useState<Types.ObjectId | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('id');
      if (id) {
        try {
          setCoachId(new Types.ObjectId(id));
        } catch (err) {
          console.error('Invalid coach ID:', err);
          setError('Invalid coach ID');
          setIsLoading(false);
        }
      } else {
        console.error('No coach ID in localStorage');
        setError('No coach ID found');
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Check if returning from AddWorkoutPage
    if (localStorage.getItem('openModalAfterWorkout')) {
      setIsModalOpen(true);
      localStorage.removeItem('openModalAfterWorkout'); // Clear the flag
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [coachId]); // Add coachId dependency

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const localCoachId = localStorage.getItem('id');

    if (!token || !localCoachId) {
      console.error('Missing token or coach ID:', { token, localCoachId });
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const profileRes = await fetch(`/api/coaches/${localCoachId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileRes.ok) {
        const errorData = await profileRes.text();
        console.error('Profile fetch error:', errorData, 'Status:', profileRes.status);
        setError(`Failed to fetch coach profile: ${errorData || profileRes.statusText}`);
        setIsLoading(false);
        return;
      }
      const profile = await profileRes.json();
      setUserName(profile.name || 'Coach');
      // setProfilePic(profile.imageUrl || '/default-profile.png');

      const clientsRes = await fetch('/api/client', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!clientsRes.ok) {
        const errorData = await clientsRes.text();
        console.error('Clients fetch error:', errorData, 'Status:', clientsRes.status);
        throw new Error(`Failed to fetch clients: ${errorData || clientsRes.statusText}`);
      }
      const allClients: IClient[] = await clientsRes.json();

      const coachClients = allClients.filter(
        (client) => client.coach.toString() === localCoachId
      );

      setTodayDate(new Date().toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

      const today = new Date().toLocaleString('en-US', { weekday: 'long' });
      const dueToday = coachClients.filter((client) => {
        const schedule = client.workoutSchedule as unknown as IWorkoutSchedule;
        return schedule?.schedule.some(
          (s) => s.weekDay === today && s.workouts.length > 0
        );
      });
      setClientsDueToday(dueToday);

      const warningsData = coachClients
        .map((client): Warning | null => {
          const schedule = client.workoutSchedule as unknown as IWorkoutSchedule;
          const missedSessions = schedule?.schedule.reduce(
            (acc, s) => acc + (s.workouts.length > 0 ? 1 : 0),
            0
          ) || 0;
          if (missedSessions > 0) {
            return {
              _id: client._id ? client._id.toString() : Math.random().toString(),
              firstName: client.firstName,
              lastName: client.lastName,
              imageUrl: client.imageUrl,
              missedSessions,
            };
          }
          return null;
        })
        .filter((w): w is Warning => w !== null);
      setWarnings(warningsData);

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
    } catch (err: any) {
      console.error('fetchData error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!coachId) {
    return <div className="text-red-500">Please log in to access the dashboard.</div>;
  }

  return (
    <div className="fixed right-0 left-20 min-h-screen bg-gray-100 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src={profilePic}
            alt="Profile"
            width={64}
            height={64}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold text-gray-800">Good Day, {userName}</h1>
        </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Client
          </button>
      </div>
      
      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClientAdded={fetchData}
        coachId={coachId}
      />

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Today's Workouts - {todayDate}</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse bg-white shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Profile</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left">Gender</th>
                  <th className="px-4 py-2 text-left">Goal</th>
                  <th className="px-4 py-2 text-left">Weight</th>
                </tr>
              </thead>
              <tbody>
                {clientsDueToday.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                      No workouts due today
                    </td>
                  </tr>
                ) : (
                  clientsDueToday.map((client) => (
                    <tr key={client._id?.toString()} className="border-b">
                      <td className="px-4 py-2">
                        <Image
                          src={client.imageUrl || '/default-profile.png'}
                          alt="Client Profile"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </td>
                      <td className="px-4 py-2">{`${client.firstName} ${client.lastName}`}</td>
                      <td className="px-4 py-2">{client.planAssigned}</td>
                      <td className="px-4 py-2">{client.gender}</td>
                      <td className="px-4 py-2">{client.goal}</td>
                      <td className="px-4 py-2">{client.currentWeight}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <div className="w-full lg:w-1/3">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Client Progress</h2>
          <div className="h-64 rounded-lg bg-gray-200 p-4">
            <p className="text-center text-gray-500">Pie Chart Placeholder</p>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
            <div className="w-full lg:w-1/2">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Warnings</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse bg-white shadow-md">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-4 py-2 text-left">Profile</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Missed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warnings.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                            No warnings
                          </td>
                        </tr>
                      ) : (
                        warnings.map((warning) => (
                          <tr key={warning._id} className="border-b">
                            <td className="px-4 py-2">
                              <Image
                                src={warning.imageUrl || '/default-profile.png'}
                                alt="Client Profile"
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </td>
                            <td className="px-4 py-2">{`${warning.firstName} ${warning.lastName}`}</td>
                            <td className="px-4 py-2">Missed {warning.missedSessions} sessions</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">Due Soon</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse bg-white shadow-md">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-4 py-2 text-left">Profile</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dueSoon.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                            No memberships due soon
                          </td>
                        </tr>
                      ) : (
                        dueSoon.map((due) => (
                          <tr key={due._id} className="border-b">
                            <td className="px-4 py-2">
                              <Image
                                src={due.imageUrl || '/default-profile.png'}
                                alt="Client Profile"
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </td>
                            <td className="px-4 py-2">{`${due.firstName} ${due.lastName}`}</td>
                            <td className="px-4 py-2">Expires in {due.daysUntilExpiration} days</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;