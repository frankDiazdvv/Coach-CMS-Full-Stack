'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState } from "react";

const loginPage: string = '/login';


// Fetch available plans from API
const Signup: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [plansInput, setPlansInput] = useState('');
    const [membershipInput, setMembershipInput] = useState('');
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

            
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-white">
            <div className='fixed top-4 left-6 hidden md:block'>
                <Link href={"/"}>
                  <Image
                    src={"/squareLogo.svg"}
                    alt='logo'
                    width={50}
                    height={50}
                    quality={80}
                  />
                </Link>
            </div>
            <div className='md:hidden pt-10'>
                <Link href={"/"}>
                  <Image
                    src={"/LT-no-bg-logo.png"}
                    alt='logo'
                    width={200}
                    height={45}
                    quality={100}
                  />
                </Link>
            </div>
            <div className="w-full max-w-md rounded-lg bg-white p-8">
                <h1 className="sm:mb-6 md:mb-10 text-center text-2xl md:text-3xl font-semibold text-gray-800">Create your Coach Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-500">
                         Name
                        </label>
                        <input
                            id="user-name"
                            type="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-500">
                         Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-500">
                         Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your password"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-500">
                         Phone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <div>
                        <label htmlFor="plans" className="block text-sm font-medium text-gray-500">
                         Plans Offered
                        </label>
                        <input
                            id="plans"
                            type="text"
                            value={plansInput}
                            onChange={(e) => setPlansInput(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Enter your plans separated by comma"
                        />
                        <p className="text-xs text-gray-400 mt-1">What Memberships/Plans do you offer?(e.g. Weight Loss, Workout + Nutrition, Starter Plan, etc.)</p>
                        
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`cursor-pointer w-full rounded-md bg-blue-600 px-4 py-3 text-white text-lg hover:bg-blue-700 focus:outline-none hover:rounded-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-2 text-center text-sm text-gray-600">
                    <p className="pb-2">All information is required<span className="text-red-500">*</span></p>
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;