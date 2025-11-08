import React from 'react';
import type { StudyPlan, UserProfileData, Mission } from '../types';
import { XP_FOR_LEVEL_UP } from '../constants';

interface StudyDashboardProps {
  plan: StudyPlan;
  userProfile: UserProfileData;
  onMissionSelect: (mission: Mission) => void;
}

const UserProfileCard: React.FC<{ userProfile: UserProfileData }> = ({ userProfile }) => {
  const currentLevelXP = XP_FOR_LEVEL_UP[userProfile.level -1] || 0;
  const nextLevelXP = XP_FOR_LEVEL_UP[userProfile.level] || XP_FOR_LEVEL_UP[XP_FOR_LEVEL_UP.length - 1];
  const xpIntoLevel = userProfile.xp - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = xpForNextLevel > 0 ? (xpIntoLevel / xpForNextLevel) * 100 : 100;

  return (
    <div className="glow-card rounded-xl p-6 sticky top-6">
      <div className='flex items-center gap-4'>
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                <circle
                    className="text-purple-500"
                    strokeWidth="8"
                    strokeDasharray={`${(progressPercentage * 2 * Math.PI * 42) / 100} ${2 * Math.PI * 42}`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-bold">{userProfile.level}</div>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-100">Level {userProfile.level}</h2>
            <p className="text-sm text-slate-400">{userProfile.xp} / {nextLevelXP} XP</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-slate-100">Badges Unlocked</h3>
        {userProfile.badges.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {userProfile.badges.map(badge => (
              <div key={badge.name} className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-full" title={`${badge.name}: ${badge.description}`}>
                {React.cloneElement(badge.icon, { className: 'w-5 h-5' })}
                <span className="text-xs text-slate-300">{badge.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 mt-2">Complete missions to earn badges!</p>
        )}
      </div>
    </div>
  );
};

const MissionItem: React.FC<{ mission: Mission, onMissionSelect: (mission: Mission) => void }> = ({ mission, onMissionSelect }) => {
  const isCompleted = mission.status === 'completed';
  return (
    <button 
      onClick={() => onMissionSelect(mission)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all text-left group ${isCompleted ? 'bg-green-500/10' : 'bg-slate-800 hover:bg-slate-700 hover:ring-2 hover:ring-purple-500'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-slate-700 group-hover:bg-purple-500'}`}>
          {isCompleted ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400 group-hover:text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-.07.002z" /></svg>
          )}
        </div>
        <div>
          <p className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'}`}>{mission.topic}</p>
          <p className="text-sm text-slate-400">{mission.subject}</p>
        </div>
      </div>
      {!isCompleted && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </button>
  );
};

const StudyDashboard: React.FC<StudyDashboardProps> = ({ plan, userProfile, onMissionSelect }) => {
  return (
    <div className="min-h-screen w-full p-4 md:p-6 lg:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold glow-text">Your Study Quest</h1>
        <p className="text-slate-400 mt-2">Complete missions to level up and earn badges!</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UserProfileCard userProfile={userProfile} />
        </div>

        <div className="lg:col-span-2 space-y-8">
          {plan.days.map(day => (
            <div key={day.day} className="glow-card rounded-xl p-4 md:p-6">
              <h2 className="text-3xl font-bold text-purple-400 mb-4">Day {day.day}</h2>
              <div className="space-y-3">
                {day.missions.map(mission => (
                  <MissionItem key={mission.id} mission={mission} onMissionSelect={onMissionSelect} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyDashboard;