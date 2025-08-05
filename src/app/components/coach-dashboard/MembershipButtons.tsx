'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { Crown } from 'lucide-react';
 
export default function PricingButtons({ coachId }: { coachId: string }) {
    const locale = useLocale();

  const starterPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER!;
  const vipPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_VIP!;

  // Debugging: Check that price IDs exist in frontend
  useEffect(() => {
    console.log('Starter Price ID:', starterPriceId);
    console.log('VIP Price ID:', vipPriceId);
  }, []);

  const handleUpgrade = async (priceId: string) => {
    let membershipName = 'Free';
    if (priceId === starterPriceId) {
      membershipName = 'Starter';
    } else if (priceId === vipPriceId) {
      membershipName = 'VIP';
    } else {
      console.error('Unknown price ID:', priceId);
      return;
    }

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, priceId, locale, planName: membershipName }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.log('Server error response:', text);
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
      }
    } catch (err) {
      console.error('Error during checkout request:', err);
    }
  };

  return (  
    <>
    <button 
          onClick={() => handleUpgrade(starterPriceId)}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"    
      >
          Upgrade to Starter
      </button>
      <button 
          onClick={() => handleUpgrade(vipPriceId)}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600/60 to-yellow-800/60 text-white rounded-xl hover:from-gray-500/50 hover:to-gray-700/50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-not-allowed"
          disabled
      >
          Upgrade to VIP <Crown/>
      </button>
    </>  
  );
}
