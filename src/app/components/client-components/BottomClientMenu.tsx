'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { CiRuler } from "react-icons/ci";
import { LuUser } from "react-icons/lu";
import { GoHome } from "react-icons/go";

const BottomClientMenu: React.FC = () => {
    const pathname = usePathname();
    const t = useTranslations('bottomNavigation');
    
    const links = [
        {
            icon: <GoHome className="text-xl" />,
            label: t('home'),
            href: "/client/client-workout-dashboard",
            active: pathname.startsWith("/client/client-workout") || pathname.startsWith("/client/client-nutrition") || pathname.includes("workout") || pathname.includes("nutrition")
        },
        {
            icon: <CiRuler className="text-xl" />,
            label: t('measurements'),
            href: "/client/client-measurement-page",
            active: pathname.startsWith("/client/client-measurement") || pathname.includes("measurement")
        },
        {
            icon: <LuUser className="text-xl" />,
            label: t('profile'),
            href: "/client/client-profile-page",
            active: pathname.startsWith("/client/client-profile") || pathname.includes("profile")
        }
    ]

    return(
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-900 to-slate-800 backdrop-blur-lg border-t border-slate-700/50 shadow-xl">
            <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={`
                            flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-0 flex-1 transition-all duration-300 ease-in-out
                            touch-manipulation select-none active:scale-95
                            ${link.active
                                ? "bg-white text-slate-900 shadow-lg transform scale-105" 
                                : "text-slate-300 hover:text-white hover:bg-slate-700/50 active:bg-slate-600/70"
                            }
                        `}
                    >
                        <div className="mb-1">
                            {link.icon}
                        </div>
                        <span className="text-xs font-medium leading-none truncate">
                            {link.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default BottomClientMenu;