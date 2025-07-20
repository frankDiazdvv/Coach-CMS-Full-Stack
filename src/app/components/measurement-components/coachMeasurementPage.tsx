//TODO:
//1. Add Database for measurement tracking per client
//2. Style the page properly


'use client';

import { useEffect, useState } from "react";
import { IClient } from "../../../../lib/models/clients";
import { Types } from "mongoose";



const CoachMeasurementPage: React.FC = () => {

    const [coachClients, setCoachClients] = useState<IClient[]>([]);
    const [coachId, setCoachId] = useState<Types.ObjectId | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isClientSelected, setIsClientSelected] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedClientData, setSelectedClientData] = useState<IClient | null>(null);
    
    //Gets and gets ID on refresh
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
        fetchData();
    }, [coachId]);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const localCoachId = localStorage.getItem('id');

        try {
            // Fetch clients
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
                (client) => client.coach._id?.toString() === localCoachId
            );
            setCoachClients(coachClients);
            console.log('Coach clients:', coachClients);
        }  catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    
    }   

    useEffect(() => {
        if (selectedClientId) {
            const selectedClient = coachClients.find((client) => client._id?.toString() === selectedClientId);
            setSelectedClientData(selectedClient || null);
        }
    }, [selectedClientId, coachClients]);

    return(
        <>
            <section className="absolute left-20 top-0 bottom-0 w-60 bg-gray-100 shadow-md border-r border-slate-200">
                {isLoading ? (
                    <div className="flex flex-col h-full justify-center self-center p-8">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading Clients...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col h-full justify-center self-center p-8">
                        <div className="flex items-center justify-center text-red-600">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {coachClients.length === 0  ? (
                            <p>No Clients</p>
                        ) : (
                            coachClients.map((client) => (
                                <div 
                                    key={client._id.toString()} 
                                    onClick={() => {
                                        setSelectedClientId(client._id.toString())
                                        setIsClientSelected(true)
                                    }}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 cursor-pointer border-b border-slate-300">
                                    <h2>{client.firstName} {client.lastName}</h2>
                                </div>
                            ))
                        )}
                    </div> 
                )}
            </section>
            <section className=" absolute left-80 right-0 top-0 bottom-0">
                {selectedClientData && (
                    <>
                        <header>
                            <h1 className="text-xl m-4 font-bold">Measurements for {selectedClientData.firstName} {selectedClientData.lastName}</h1>
                            <div className="border border-slate-200 shadow-md rounded-lg px-3 py-1 m-4">
                                <h2 className="font-semibold text-lg">Client Details</h2>
                                <div className="flex flex-row gap-4 m-2">
                                    <p>Plan: {selectedClientData.planAssigned}</p>
                                    <p>Goal: {selectedClientData.goal}</p>
                                    <p>Starting Weight: {selectedClientData.currentWeight}</p>
                                </div>
                            </div>
                        </header>
                        <main>
                            <h1 className="text-xl m-4 font-bold">Data-points to track</h1>
                            <div className="flex flex-row m-4 gap-2">
                                <input 
                                    type="text" 
                                    placeholder="e.g. weight, arm size" 
                                    className="border border-slate-400 rounded"
                                />
                                <select name="unit" id="unit">
                                    <option value="Select" disabled>Unit</option>
                                    <option value="Lenght" disabled>Length Units</option>
                                    <option value="inch">Inch (in)</option>
                                    <option value="feet">Foot (ft)</option>
                                    <option value="cm">Centimeter (cm)</option>
                                    <option value="mm">Milimeters (mm)</option>
                                    <option value="weight" disabled>Weight Units</option>
                                    <option value="lb">Pounds (lb)</option>
                                    <option value="kg">Kilograms (kg)</option>
                                </select>
                                <select name="frequency" id="frequency">
                                    <option value="Select" disabled>Frequency</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="bi-weekly">Bi-Weekly</option>
                                    <option value="2months">2 months</option>
                                    <option value="trimester">Trimester</option>
                                    <option value="6months">6 Months</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <label htmlFor="startdate">Start Date: </label>
                                <input type="date" id="startdate" />
                                <button className="px-2 border rounded cursor-pointer bg-gray-100">Add</button>
                            </div>
                        </main>
                    </>
                )}
            </section>
        </>
    );   
}

export default CoachMeasurementPage;