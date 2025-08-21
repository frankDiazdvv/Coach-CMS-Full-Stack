import LeftSideNav from "@/app/components/LeftSideNav";
import Image from "next/image";

export default function AboutPage(){

    return(
        <>
            <LeftSideNav/>
            <main className="ml-20 p-4 bg-gradient-to-br from-slate-50 to-purple-100 h-dvh cursor-default flex items-center justify-center">
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
                    <h1 className="mb-6 text-lg">Thank you for using LITE Trainer 💪</h1>
                    <div>
                        <p className="text-gray-500">
                            If you have any questions, suggestions, or feedback, please feel free to email us through this link:
                        </p>
                        <p className="mt-2">
                            <a href="mailto:fmdiazvip@gmail.com" className="text-yellow-600 p-1 rounded-lg hover:bg-yellow-50/70 transition-all duration-100">
                                Contact Us
                            </a>
                        </p>
                        
                    </div> 
                </div>
            </main>
            <footer className="absolute bottom-0 left-20 right-0 text-white py-4">
                <div className="text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} LITE Trainer. All rights reserved.</p>
                </div>
            </footer>
        </>
        
    );
}