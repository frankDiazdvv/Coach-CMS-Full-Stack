'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CiRuler } from "react-icons/ci";
import { LuUser } from "react-icons/lu";
import { GoHome } from "react-icons/go";


const BottomClientMenu: React.FC = () => {

    const pathname = usePathname();

    const links = [
        {
            name: <GoHome/>,
            href: "/client/client-workout-dashboard",
            active: pathname === "/client-side/client-workout-dashboard" || pathname === "/client-side/client-nutrition-dashboard"
        },
        {
            name: <CiRuler/>,
            href: "/client/client-measurement-page",
            active: pathname === "/client-side/client-measurement-page"
        },
        {
            name: <LuUser/>,
            href: "/client/client-profile-page",
            active: pathname === "/client-side/client-profile-page"
        }
    ]

    return(
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#234459] h-20 shadow-md">
            <div className="flex justify-around items-center h-full">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={`${link.active 
                            ? "text-black text-2xl font-semibold bg-white rounded-2xl py-2 px-4" 
                            : "text-white text-2xl py-2 px-4"}`
                        }
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
           
        </div>
    );
}

export default BottomClientMenu;