import LandingPageTopBar from "@/app/components/LandingPageTopBar";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";



export default function ResourcesPage() {

    const t = useTranslations();

    return(
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            <LandingPageTopBar/>

            <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-8xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-light mb-8 leading-none">
                        {t("buildSomething")} <span className="bg-gradient-to-r from-blue-600 to-blue-200 bg-clip-text text-transparent">Cool</span>
                    </h1>
                    <div className="mt-12">
                        <div className="flex flex-row rounded-3xl max-w-xl max-h-80 mx-auto bg-slate-800/90 backdrop-blur-sm hover:shadow-lg">
                            <div className="relative w-full aspect-square overflow-hidden rounded-l-3xl">
                                <Image
                                    src="/food-json-img.png"
                                    alt="Food Json ScreenShot"
                                    fill={true} // The `fill` property expands the image to fit its parent
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div className="flex flex-col justify-between w-full max-w-md">
                                <div className="p-4">
                                    <p className="">{t("foodLibraryTitle")}</p>
                                    <ul className="text-sm font-thin mt-4 space-y-1 text-left leading-tight list-disc list-inside ml-8">
                                        <li>{t("bilingual")}</li>
                                        <li>{t("macrosPer100g")}</li>
                                        <li>{t("servingSizes")}</li>
                                        <li>{t("categories")}</li>
                                    </ul>
                                    
                                </div>
                                <div className="flex flex-row gap-4 justify-center items-center mt-auto mb-4">
                                    <Link href={"https://github.com/frankDiazdvv/lite-trainer-food-db/tree/main"} target="_blank" rel="noopener noreferrer">
                                        <button className="cursor-pointer border border-slate-500 rounded-md text-sm p-3 text-black bg-white hover:bg-white/90">Github Repo</button>
                                    </Link>
                                    
                                    {/* <button className="cursor-pointer border border-slate-500 rounded-md text-sm p-3 bg-white text-black hover:bg-white/90">Download JSON</button> */}
                                </div>
                            </div>
                            
                            
                        </div>
                       

                    </div>
                </div>
                
            </main>
           
        </div>
    );

};