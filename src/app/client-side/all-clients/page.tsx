'use client';

import { useState, useEffect } from 'react';
import LeftSideNav from '@/app/components/LeftSideNav';
import { IClient } from '../../../../lib/models/clients';
import ViewClientDetailsModal from '@/app/components/ViewClientDetailsModal';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null); // Track selected client

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token');

        const response = await fetch('/api/client', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch clients');

        const data = await response.json();
        setClients(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Current date and time
  const currentDate = new Date('2025-06-08T12:47:00-04:00'); // EDT offset
  const formattedDate = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <LeftSideNav />

      {/* Main Content */}
      <main className="flex-1 ml-20 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Clients List - {formattedDate}</h1>

        {loading && <p className="text-gray-600">Loading clients...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && clients.length === 0 && <p className="text-gray-600">No clients found.</p>}
        {!loading && !error && clients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead>
                <tr className="bg-[#234459] text-white">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Phone</th>
                  <th className="py-2 px-4 text-left">Goal</th>
                  <th className="py-2 px-4 text-left">Plan Assigned</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr 
                    key={client._id?.toString()} 
                    onClick={() => { setIsModalOpen(true); setSelectedClient(client); }} // Set selected client on click
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-2 px-4">{`${client.firstName} ${client.lastName}`}</td>
                    <td className="py-2 px-4">{client.email}</td>
                    <td className="py-2 px-4">{client.phone}</td>
                    <td className="py-2 px-4">{client.goal}</td>
                    <td className="py-2 px-4">{client.planAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ViewClientDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          client={selectedClient} // Pass selected client to modal
        />
      </main>
    </div>
  );
};

export default ClientsPage;