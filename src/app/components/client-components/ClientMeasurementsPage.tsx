'use client';

import { useTranslations } from "next-intl";
import { TfiRulerPencil } from "react-icons/tfi";

const ClientMeasurementsPage: React.FC = () => {
    const t = useTranslations();


    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl"><TfiRulerPencil/></span>
                        </div>
                        <h2 className="text-xl font-bold">{t("yourMeasurements")}</h2>
                        <p className="text-blue-600 text-lg w-full font-medium">{t("comingSoon")}</p>
                    </div>
                </div>
            </div>
    );
}

export default ClientMeasurementsPage;