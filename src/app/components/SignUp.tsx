'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from "react";

const loginPage: string = '/client-side/login';


// Fetch available plans from API
const Signup: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [plansInput, setPlansInput] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        //Take out spaces from plans input and filter out empty strings
        const parsedPlans = plansInput.split(',').map(p => p.trim()).filter(p => p);

        try{
            const response = await fetch('/api/coaches', {
                method: 'POST',
                body: JSON.stringify({
                    name, email, password, phone, plans: parsedPlans
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to signup');
            }
            router.push(loginPage);
            alert('Signup successful');

            
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-700">
                         Name
                        </label>
                        <input
                            id="user-name"
                            type="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                         Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                         Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your password"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                         Phone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div>
                        <label htmlFor="plans" className="block text-sm font-medium text-gray-700">
                         Plans
                        </label>
                        <input
                            id="plans"
                            type="text"
                            value={plansInput}
                            onChange={(e) => setPlansInput(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your plans separated by comma"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                    <p>
                        Already have an account?{' '}
                        <Link href="/client-side/login" className="text-blue-600 hover:underline">
                        Sign In
                        </Link>
                    </p>
                    <p>
                        Forgot your password?{' '}
                        <Link href="/forgot-password" className="text-blue-600 hover:underline">
                        Reset it
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;