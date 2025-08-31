'use client'

import Link from "next/link";
import { FaHome, FaUsers, FaInfoCircle, FaRuler, FaUser } from "react-icons/fa"; // Import icons from react-icons
import { useState } from "react";
import {Home, Users, Info, Ruler, User} from "lucide-react";

const LeftSideNav: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null); // State for hover text


  // Redirect Links

  const coachDashboard = "/coach/coach-dashboard";
  const allClients = "/coach/all-clients";
  const measurements = "/coach/coach-side-measurement-page";
  const coachProfile = "/coach/coach-profile-page";
  const aboutPage = "/coach/about-page"; // SOON TO BE CHANGED

  return (
  <>
    {/* Left Side Navigation - Desktop */}
    <nav className="hidden fixed left-0 top-0 bottom-0 shadow-xl/30 bg-[#1F2D3D] w-20 md:flex flex-col items-center justify-start p-4 z-100">
      <ul className="flex flex-col gap-10 py-6 w-full text-white">
        {/* Home - Coach Dashboard */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Home")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={coachDashboard} className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <Home />
          </Link>
          {hoveredItem === "Home" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Home
            </span>
          )}
        </li>
        {/* All Clients Page */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Clients")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={allClients} className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <Users />
          </Link>
          {hoveredItem === "Clients" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Clients
            </span>
          )}
        </li>
        {/* Measurements Page */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Measurements")}
          onMouseLeave={() => setHoveredItem(null)}
        >

          {/* Enable for production use <Link href={clientMeasurements}> */}
          <div className="cursor-not-allowed flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <Ruler />
          </div>
          {hoveredItem === "Measurements" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Measurements
            </span>
          )}
        </li>
        {/* Coach Profile */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Profile")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={coachProfile} aria-disabled className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors {some-condition ? 'pointer-events-none' : ''}">
            <User />
          </Link>
          {hoveredItem === "Profile" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Coach Profile
            </span>
          )}
        </li>
        {/* About Page */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("About")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={aboutPage} className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <Info />
          </Link>
          {hoveredItem === "About" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              About
            </span>
          )}
        </li>
      </ul>
    </nav>
    {/* Bottom Bar - Mobile */}
    <nav className="fixed left-0 right-0 bottom-0 shadow-xl/30 bg-[#1F2D3D] w-full h-18 flex md:hidden flex-row items-center justify-start p-4 z-100">
      <ul className="flex flex-row justify-between w-full px-24 text-white">
        {/* Home - Coach Dashboard */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Home")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={coachDashboard} className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <Home />
          </Link>
          {hoveredItem === "Home" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Home
            </span>
          )}
        </li>
        {/* Coach Profile */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Profile")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={coachProfile} aria-disabled className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors {some-condition ? 'pointer-events-none' : ''}">
            <User />
          </Link>
          {hoveredItem === "Profile" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Coach Profile
            </span>
          )}
        </li>
        {/* About Page */}
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("About")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href={aboutPage} className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <Info />
          </Link>
          {hoveredItem === "About" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              About
            </span>
          )}
        </li>
      </ul>
    </nav>
  </>
        
  );
};

export default LeftSideNav;

