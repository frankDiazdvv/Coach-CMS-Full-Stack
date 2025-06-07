
interface WorkoutCardProps{
    name: string;
    sets: number;
    reps: number;
    targetWeight?: string;
    imageUrl?: string;
    onClick: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ name, sets, reps, targetWeight, imageUrl, onClick }) => {


    return(
        <div 
        onClick={onClick}
        className="flex flex-row rounded border w-11/12 bg-gray-100  hover:brightness-110 cursor-pointer"
        >
            <div className="bg-gray-400 text-center h-full w-14 ">
                <img
                 src={imageUrl || '/default-workout.png'} 
                 alt="Exercise Image"
                 className="flex content-center items-center self-center"
                 />
            </div>
            <div className="flex flex-col px-1">   
                <h2 className="text-sm">{name}</h2>
                <h3 className="text-xs">{sets} x {reps}</h3>
                {targetWeight &&
                <>
                    <p className="text-sm">Target Weight:</p><br />
                    <h3 className="text-sm">{targetWeight}</h3>
                </>
                }
            </div>
        </div>
    );
}

export default WorkoutCard;