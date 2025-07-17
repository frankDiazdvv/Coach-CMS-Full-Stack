// // components/ExpandExerciseDetailsModal.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { IDailyWorkout, IWorkout } from '../../../../lib/models/workouts'; 
// import LogWorkoutModal from './LogWorkoutModal';

// interface ExpandExerciseDetailsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedDay: IDailyWorkout | null;
//   dueToday: boolean;
// }

// const ExpandExerciseDetailsModal: React.FC<ExpandExerciseDetailsModalProps> = ({ isOpen, onClose, selectedDay, dueToday }) => {
//   const [logWorkout, setLogWorkout] = useState<IDailyWorkout | null>(null);

//   if (!isOpen || !selectedDay) return null;

//   const handleCloseLog = () => {
//     setLogWorkout(null);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//         {/* Header with Day Name and Close Button */}
//         <div className="flex justify-between items-center border-b pb-2 mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">{selectedDay.weekDay}</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//           >
//             &times;
//           </button>
//         </div>

//         {/* Workout Details List */}
//         <div className="space-y-4 max-h-96 overflow-y-auto">
//           {selectedDay.workouts.map((workout: IWorkout, index: number) => (
//             <div key={index} className="border p-4 rounded-md shadow-sm">
//               <h3 className="text-lg font-medium text-gray-700">{workout.name}</h3>
//               <p className="text-gray-600">Sets: {workout.sets}</p>
//               <p className="text-gray-600">Reps: {workout.reps}</p>
//               <p className="text-gray-600">Target Weight: {workout.targetWeight || 'N/A'}</p>
//               <p className="text-gray-600">Comment: {workout.comment || 'No comment'}</p>
//             </div>
//           ))}
//         </div>
//         {/* Footer with Due Today Status */}
//         <div className="mt-4"> 
//             {dueToday ? (
//               <button 
//                 className='border py-2 px-3 bg-blue-400 text-white font-semibold rounded-lg active:bg-red-300'
//                 onClick={() => setLogWorkout(selectedDay)}
//               >
//                 LOG WORKOUT
//               </button>
//             ) : (
//                 <p className='italic text-sm text-gray-500 p-0 m-0'>*Contact your coach for any concerns</p>
//             )}
//         </div>
// //       </div>
// //       <LogWorkoutModal
// //         isOpen={isOpen}
// //         onClose={handleCloseLog}
// //         selectedDueDay={logWorkout} 
// //         onLogComplete={() => {}}
// //       />
// //     </div>
//   );
// };

// export default ExpandExerciseDetailsModal;