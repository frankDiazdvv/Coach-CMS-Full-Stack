// app/reset-password/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setErrorMsg('Missing token or email in URL');
    }
  }, [email, token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setStatus('loading');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword: password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      setStatus('success');
      setTimeout(() => router.push('/login'), 3000); // redirect after 3s
    } else {
      const text = await res.text();
      setStatus('error');
      setErrorMsg(text || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

      {status === 'success' ? (
        <p className="text-green-600">Password reset successful! Redirecting...</p>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
          {status === 'error' && <p className="text-red-600 text-sm">{errorMsg}</p>}
        </form>
      )}
    </div>
  );
}
