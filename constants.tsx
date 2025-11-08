
import React from 'react';

export const XP_PER_MISSION = 50;
export const XP_FOR_LEVEL_UP = [0, 100, 250, 500, 1000, 2000, 4000, 8000]; 

export const BadgeIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.071L12 3.424l-1.07-1.07a.75.75 0 00-1.07 1.071L10.929 4.5l-1.07 1.07a.75.75 0 101.07 1.071L12 5.57l1.07 1.07a.75.75 0 101.07-1.071L13.071 4.5l1.07-1.07a.75.75 0 00-1.178-1.144z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12 1.5c-5.923 0-8.32.325-9.403 1.086C1.5 3.37 1.5 4.515 1.5 6.376v9.248c0 1.86 0 3.006 1.097 3.79 1.083.76 3.48.361 9.403.361s8.32.4 9.403-.36c1.097-.785 1.097-1.93 1.097-3.79V6.376c0-1.86 0-3.006-1.097-3.79C20.32.686 17.923 1.5 12 1.5zM3 9.415c0-1.834 0-2.653.456-3.155.455-.504 1.274-.504 3.044-.504h10.5c1.77 0 2.589 0 3.044.504.456.502.456 1.32.456 3.155v4.67c0 1.834 0 2.653-.456 3.155-.455.504-1.274.504-3.044.504H6.5c-1.77 0-2.589 0-3.044-.504C3 16.738 3 15.92 3 14.085v-4.67z" clipRule="evenodd" />
  </svg>
);

export const BADGES = {
  FIRST_MISSION: { name: 'First Step', description: 'Completed your first mission!', icon: <BadgeIcon className="w-10 h-10 text-green-400" /> },
  SUBJECT_MASTER: (subject: string) => ({ name: `${subject} Adept`, description: `Completed all ${subject} missions!`, icon: <BadgeIcon className="w-10 h-10 text-purple-400" /> }),
  PERFECT_QUIZ: { name: 'Quiz Whiz', description: 'Scored 100% on a quiz.', icon: <BadgeIcon className="w-10 h-10 text-yellow-400" /> },
  PLAN_STARTED: { name: 'Planner Pro', description: 'Generated your first study plan.', icon: <BadgeIcon className="w-10 h-10 text-blue-400" /> }
};

export const loadingMessages = [
  "Consulting the cosmos for knowledge...",
  "Brewing a fresh pot of genius...",
  "Untangling the threads of wisdom...",
  "Waking up the silicon brain...",
  "Reticulating splines...",
  "Generating witty loading messages...",
  "Assembling bytes of brilliance..."
];
