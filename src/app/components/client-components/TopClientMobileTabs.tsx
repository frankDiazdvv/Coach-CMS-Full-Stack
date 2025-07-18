'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';

const TopClientMobileTabs: React.FC = () => {
    const pathname = usePathname();
    const t = useTranslations('navigation');
    
    const links = [
        {
            name: t('myWorkouts'),
            href: "/client/client-workout-dashboard",
            active: pathname.startsWith("/client/client-workout") || pathname.includes("workout")
        },
        {
            name: t('myNutrition'),
            href: "/client/client-nutrition-dashboard",
            active: pathname.startsWith("/client/client-nutrition") || pathname.includes("nutrition")
        }
    ]
   
    return(
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 backdrop-blur-lg border-b border-slate-700/50 shadow-xl">
            <div className="flex justify-center items-center h-16 px-4 max-w-md mx-auto">
                <div className="flex bg-slate-700/50 rounded-full p-1 gap-1 w-full">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className={`
                                flex-1 text-center py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
                                touch-manipulation select-none active:scale-95 active:bg-slate-500/70
                                ${link.active
                                    ? "bg-white text-slate-900 shadow-lg transform scale-105" 
                                    : "text-slate-300 hover:text-white hover:bg-slate-600/50"
                                }
                            `}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TopClientMobileTabs;