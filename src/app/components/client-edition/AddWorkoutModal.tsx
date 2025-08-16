'use client';

import { useState, useEffect } from 'react';
import WorkoutDetailsModal from './WorkoutDetailsModal';
import { useLocale, useTranslations } from 'next-intl';
import WorkoutLibraryModal from './CustomWorkoutLibrary';

interface Workout {
  id: number;
  name: string;
  category: string;
  images: string[];
  sets: number,
  reps: number,
  targetWeight?: string,
  comment?: string,
  workoutUrl?: string;
}

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkout: (
    workoutName: string, 
    workoutImg: string[],
    sets: number,
    reps: number,
    targetWeight?: string,
    comment?: string,
    workoutUrl?: string,
  ) => void;
}

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ isOpen, onClose, onSelectWorkout }) => {
  const t = useTranslations();
  const tCategory = useTranslations('workoutCategories');
  const [searchQuery, setSearchQuery] = useState('');
  const [coachId, setCoachId] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedWorkoutImg, setSelectedWorkoutImg] = useState<string[]>([]);
  const [getFromWorkoutLibrary, setGetFromWorkoutLibrary] = useState(false);
  const locale = useLocale();

  const noWorkoutIcon = '/no-image-icon.png';

  useEffect(() => {
    const id = localStorage.getItem('id');
    setCoachId(id);
  },[]);


  // Fetch workouts from API when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchWorkouts = async () => {
        setIsLoading(true);
        setError('');

        const languageId = locale === 'es' ? 4 : 2;


        try {
            const response = await fetch(`https://wger.de/api/v2/exerciseinfo/?language=${languageId}&limit=2000`);
            if (!response.ok) throw new Error('Failed to fetch workouts');
            const data = await response.json();

            // Map exercises with name, description, and fetch images
            const workoutListPromises = data.results.map(async (w: any) => {
              const translation = w.translations.find((t: any) => t.language === languageId);
              const category = w.category ? w.category.name : 'No Category';

              // Fetch images for this exercise
              let images: string[] = [];
              try {
                const imageResponse = await fetch(`https://wger.de/api/v2/exerciseimage/?exercise=${w.id}`);
                if (imageResponse.ok) {
                  const imageData = await imageResponse.json();
                  images = imageData.results.map((img: any) => img.image);
                }
              } catch (imgError) {
                console.warn(`No images found for exercise ${w.id}`);
              }

              return translation && translation.name && translation.name.trim() !== ''
                ? {
                    id: w.id,
                    name: translation.name,
                    category: category,
                    images,
                  }
                : null;
            });

            // Resolve all promises to get the workout list
            const workoutList = (await Promise.all(workoutListPromises)).filter(
              (w: any) => w !== null
            );

            setWorkouts(workoutList);
            setFilteredWorkouts(workoutList);

        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to Load Workouts";
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkouts();
    }
  }, [isOpen, locale]);

  //Search bar for workouts
  useEffect(() => {
    setFilteredWorkouts(
      workouts.filter(
        (workout) =>
          workout.name &&
          workout.category &&
          (workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tCategory(workout.category).toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [searchQuery, workouts, tCategory]);

  const handleWorkoutSelect = (workoutName: string, workoutImages: string[]) => {
    setSelectedWorkout(workoutName); // Open WorkoutDetailsModal
    setSelectedWorkoutImg(workoutImages);
  };

  const handleWorkoutDetailsSubmit = (workoutImg: string[], sets: number, reps: number, targetWeight?: string, comment?: string, workoutUrl?: string) => {
    if (selectedWorkout) {
      onSelectWorkout(selectedWorkout, workoutImg, sets, reps, targetWeight, comment, workoutUrl);
    }
    setSelectedWorkout(null);
    setSelectedWorkoutImg([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">{t("addWorkout")}</h2>
          {/* Search Bar */}
          <input
            type="text"
            placeholder={t("searchBarPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />

          {/* Scrollable Workout List */}
          <div className="max-h-100 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredWorkouts.length === 0 ? (
              <p className="text-gray-500">{t("noWorkoutFound")}</p>
            ) : (
              filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => {
                    handleWorkoutSelect(workout.name, workout.images)
                    
                  }}
                  className="flex items-center gap-4 cursor-pointer rounded-md p-2 hover:bg-gray-100 transition"
                >
                  <img
                    src={workout.images[0] || noWorkoutIcon}
                    alt=''
                    className="w-14 h-14 object-cover rounded-md bg-gray-200"
                  />
                  <div>
                    <h3 className="text-base font-medium text-black">{workout.name}</h3>
                    <p className='text-sm text-gray-500'>{tCategory(workout.category)}</p>
                  </div>
                 
                </div>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setGetFromWorkoutLibrary(true)}
              className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("fromLibrary")}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl shadow-md hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
      {getFromWorkoutLibrary && (
      <WorkoutLibraryModal
        coachId={coachId}
        isOpen={getFromWorkoutLibrary}
        onClose={() => setGetFromWorkoutLibrary(false)}
        onSelect={(workoutName, workoutImg, sets, reps, targetWeight, comment, workoutUrl) => {
          onSelectWorkout(workoutName, workoutImg, sets, reps, targetWeight, comment, workoutUrl);
          setGetFromWorkoutLibrary(false); // close library
          onClose(); //close AddWorkoutModal
        }}
      />
    )}

      {selectedWorkout && (
          <WorkoutDetailsModal
            isOpen={!!selectedWorkout}
            workoutName={selectedWorkout}
            workoutImages={selectedWorkoutImg || []}
            onClose={() => {
              setSelectedWorkout(null);
              setSelectedWorkoutImg([]);
            }}
            onSubmit={handleWorkoutDetailsSubmit}
          />
        )}
      </>
  );
};

export default AddWorkoutModal;