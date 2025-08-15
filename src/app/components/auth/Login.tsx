'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const clientDashboard = '/client/client-workout-dashboard';
const coachDashboard = '/coach/coach-dashboard';

interface LoginResponse {
  token: string;
  role: 'coach' | 'client';
  id: string;
  firstName: string;
  imageUrl: string;
  workoutScheduleId: string;
  nutritionScheduleId: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      // Store token in localStorage (or use cookies for better security)
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('id', data.id);
      localStorage.setItem('name', data.firstName);
      localStorage.setItem('profileImageUrl', data.imageUrl);
      localStorage.setItem('workoutScheduleId', data.workoutScheduleId);
      localStorage.setItem('nutritionScheduleId', data.nutritionScheduleId);

      // Redirect based on role
      if (data.role === 'coach') {
        router.push(coachDashboard);
      } else {
        router.push(clientDashboard);
      }
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
      
      
      <div className="w-full max-w-md rounded-lg bg-white p-8 mx-4">
        <h1 className="mb-10 text-center font-semibold text-3xl">Sign in to your account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
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
              className="mt-1 block w-full rounded-md border hover:border-slate-800 border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter your password"
            />
            <p className='text-xs text-gray-600 pt-1 px-1'>New Client? Ask your coach for your password to log in</p>
          </div>
          {error && <p className="text-sm text-red-500">Email or Password didn&apos;t match. Try Again.</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`cursor-pointer w-full rounded-md bg-blue-600 px-4 py-3 text-white text-lg hover:bg-blue-700 hover:rounded-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            New to Coaching?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Forgot coach password?{' '}
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Reset it
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;