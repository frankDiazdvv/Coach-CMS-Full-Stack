import { useTranslations } from "use-intl";
import { FaRegCommentDots } from "react-icons/fa6";

interface WorkoutCardProps{
    name: string;
    sets: number;
    reps: number;
    targetWeight?: string;
    comment?: string;
    onClick: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ name, sets, reps, targetWeight, comment, onClick }) => {
    const t = useTranslations();


    return(
        <div 
            onClick={onClick}
            className="w-full p-3 mb-2 border border-gray-300 rounded-xl bg-gray-50/30 hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 transform hover:scale-105"
        > 
            <div className="flex flex-col px-1"> 
                <div className="flex items-center justify-between mb-0">
                    <h2 className="text-sm font-semibold text-gray-800 truncate">{name}</h2>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>  
                <div className="flex flex-row gap-2">
                    <h3 className="text-xs">{sets} x {reps}</h3>
                    <div className="flex flex-row">
                        {targetWeight ? (
                            <h3 className="text-xs text-gray-600 truncate mr-0.5">{t('weight')}: <span>{targetWeight}</span></h3>
                        ) : (
                            <h3 className="text-xs text-gray-600 truncate mr-0.5">{t('weight')}: <span>n/a</span></h3>
                        )}
                        
                    </div>
                    {comment !== 'No Comment' && (
                            <div className="flex justify-center self-center text-xs text-amber-600 font-medium">
                                <FaRegCommentDots/>
                            </div>
                        )}
                </div>
                
                
            </div>
        </div>
    );
}

export default WorkoutCard;