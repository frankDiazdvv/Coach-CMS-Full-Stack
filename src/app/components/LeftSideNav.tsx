'use client'

import Link from "next/link";
import { FaHome, FaUsers, FaInfoCircle } from "react-icons/fa"; // Import icons from react-icons
import { useState } from "react";

const LeftSideNav: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null); // State for hover text

  return (
    <nav className="fixed left-0 top-0 bottom-0 bg-[#234459] w-20 flex flex-col items-center justify-start p-4 z-10">
      <ul className="flex flex-col gap-10 py-6 w-full text-white">
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Home")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href="/client-side/coach-dashboard" className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <FaHome />
          </Link>
          {hoveredItem === "Home" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Home
            </span>
          )}
        </li>
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("Clients")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href="/client-side/all-clients" className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <FaUsers />
          </Link>
          {hoveredItem === "Clients" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Clients
            </span>
          )}
        </li>
        <li
          className="relative"
          onMouseEnter={() => setHoveredItem("About")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href="/contact" className="flex items-center justify-center text-2xl hover:text-gray-300 transition-colors">
            <FaInfoCircle />
          </Link>
          {hoveredItem === "About" && (
            <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              About
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default LeftSideNav;