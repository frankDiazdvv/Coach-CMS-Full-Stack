import { useTranslations } from "use-intl";
import { FaRegCommentDots } from "react-icons/fa6";
import { RiLinkM } from "react-icons/ri";

interface WorkoutCardProps{
    name: string;
    workoutImages: string;
    sets: number;
    reps: number;
    targetWeight?: string;
    comment?: string;
    workoutUrl?: string;
    onClick: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ name, workoutImages, sets, reps, targetWeight, comment, workoutUrl, onClick }) => {
    const t = useTranslations();
    const noWorkoutIcon = '/no-image-icon.png';


    return(
        <div 
            onClick={onClick}
            className="w-full mb-2 border border-gray-300 rounded-xl bg-gray-50/30 hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 transform hover:scale-105"
        > 
            <div className="relative flex flex-row w-full overflow-hidden">
                <div className="flex-shrink-0 flex items-center">
                    <img src={workoutImages || noWorkoutIcon} alt="" className="w-16 h-16 border-r border-gray-300 object-cover rounded-l-xl" />
                </div>
                <div className="absolute top-0 right-0 bottom-0 left-16 flex flex-col px-1 ">
                    <div className="relative w-full flex items-center justify-between mb-0">
                        <div className="overflow-hidden">
                            <h2 className="text-sm font-semibold text-gray-800 truncate">{name}</h2>
                        </div>
                        <div className="">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>    
                    </div>  
                    <div className="flex flex-row gap-2">
                        <h3 className="text-xs">{sets} x {reps}</h3>
                        
                        {comment !== 'No Comment' && (
                            <div className="flex justify-center self-center text-xs text-amber-600 font-medium">
                                <FaRegCommentDots/>
                            </div>
                        )}
                        {workoutUrl && (
                            <div className="flex justify-center self-center text-xs text-blue-600 font-medium">
                                <RiLinkM/>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row">
                            {targetWeight ? (
                                <h3 className="text-xs text-gray-600 truncate mr-0.5">{t('weight')}: <span>{targetWeight}</span></h3>
                            ) : (
                                <h3 className="text-xs text-gray-600 truncate mr-0.5">{t('weight')}: <span>n/a</span></h3>
                            )}
                            
                        </div>
                </div>
            </div> 
        </div>
    );
}

export default WorkoutCard;