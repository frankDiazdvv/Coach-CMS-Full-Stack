'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const TopClientMobileTabs: React.FC = () => {

    const pathname = usePathname();

    const links = [
        {
            name: "My Workouts",
            href: "/client/client-workout-dashboard",
            active: pathname === "/client-side/client-workout-dashboard"
        },
        {
            name: "My Nutrition",
            href: "/client/client-nutrition-dashboard",
            active: pathname === "/client-side/client-nutrition-dashboard"
        }
    ]
    

    return(
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#234459] h-20 shadow-md">
            <div className="flex justify-around items-center h-full">
                {links.map((link, index) => (
                    <Link 
                        key={index} 
                        href={link.href} 
                        className={`${link.active 
                            ? "text-black text-lg font-semibold bg-white rounded-2xl py-2 px-4" : "text-white text-lg py-2 px-4"}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
            
        </div>
    );
}

export default TopClientMobileTabs;