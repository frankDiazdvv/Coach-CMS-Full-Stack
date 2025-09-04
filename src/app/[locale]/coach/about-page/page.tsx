import LeftSideNav from "@/app/components/LeftSideNav";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage(){
    const t = useTranslations();

    return(
        <>
            <LeftSideNav/>
            <main className="md:ml-20 p-4 bg-gradient-to-br from-slate-50 to-purple-100 h-dvh cursor-default flex items-center justify-center">
                <div className="absolute top-6 right-6">
                    <Image
                        src="/squareLogo.svg"
                        alt="LITE Trainer Logo"
                        width={50}
                        height={50}
                        className="mb-4"
                    />
                </div>
                <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full mx-4">
                    <h1 className="mb-6 text-lg">{t("thankYouForUsing")}</h1>
                    <div>
                        <p className="text-gray-500">
                            {t("thankYouText")}
                        </p>
                        <p className="mt-2">
                            <a href="mailto:fmdiazvip@gmail.com" className="text-yellow-600 rounded-lg hover:bg-yellow-50/70 transition-all duration-100">
                                {t("contactUs")}
                            </a>
                        </p>                      
                    </div> 
                    <h3 className="pt-4 mb-2 text-gray-500">{t("leaveReviewTitle")}:</h3>
                    <Link
                        href={'https://www.goodfirms.co/review/68aa3bf8a1cab3372205b012'}
                        className="text-purple-600 rounded-lg hover:bg-purple-50/70 transition-all duration-100"
                    >
                        {t("leaveReviewLink")}
                    </Link>
                </div>
            </main>
            <footer className="absolute bottom-20 md:bottom-0 left-0 md:left-20 right-0 text-white py-4">
                <div className="text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} LITE Trainer. All rights reserved.</p>
                </div>
            </footer>
        </>
        
    );
}