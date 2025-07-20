// pages/index.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Top Nav */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">SimpleFit</h1>
        <Link href="/login">
          <button className="text-white p-2  hover:bg-blue-800 font-normal rounded-xl bg-blue-600 hover:rounded-full transition-all ease-in-out cursor-pointer ">
            Login
          </button>
        </Link>
      </header>

      {/* Main Hero */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
          Simple Coaching Software for New Fitness Coaches
        </h2>
        <p className="text-lg max-w-2xl mb-10 text-gray-600">
          SimpleFit helps new fitness coaches manage clients, plan workouts and nutrition, and stay on top of client check-ins — all in one place.
        </p>
        <button className="mt-4 cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md transition">
          Get Started
        </button>
      </main>

      {/* Features */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-bold mb-2">Client Management</h3>
            <p className="text-gray-600">Easily add, track, and communicate with clients as you grow your coaching business.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Workout & Nutrition Scheduling</h3>
            <p className="text-gray-600">Create tailored workout and meal plans for your clients with minimal setup.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Client Check-ins</h3>
            <p className="text-gray-600">Clients can log workouts and stay accountable through a trackable check-in system.</p>
          </div>
        </div>
      </section>

      {/* Pricing Notice */}
      <section className="bg-gray-100 text-center py-12 px-4">
        <h4 className="text-xl font-semibold text-gray-700 mb-2">Membership Plans Coming Soon!</h4>
        <p className="text-gray-500">We’re working on flexible pricing for every coach. Stay tuned for updates!</p>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} SimpleFit. All rights reserved.
      </footer>
    </div>
  );
}
