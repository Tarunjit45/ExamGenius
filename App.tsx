import React, { useState, useCallback, useEffect } from 'react';
import SyllabusUploader from './components/SyllabusUploader';
import StudyDashboard from './components/StudyDashboard';
import TopicModal from './components/TopicModal';
import Loader from './components/Loader';
import CameraCapture from './components/CameraCapture';
import * as geminiService from './services/geminiService';
import type { AppState, SyllabusTopic, StudyPlan, UserProfileData, Mission } from './types';
import { XP_PER_MISSION, XP_FOR_LEVEL_UP, BADGES } from './constants';

const LevelUpModal: React.FC<{ level: number, onClose: () => void }> = ({ level, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="text-center transform transition-all animate-pop-in">
                <p className="text-3xl md:text-4xl font-bold text-yellow-300">LEVEL UP!</p>
                <p className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 glow-text">{level}</p>
                <p className="mt-4 text-slate-300">New abilities unlocked!</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700">Continue Quest</button>
            </div>
            <style>{`
                @keyframes pop-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-in {
                    animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    )
}

interface PlanningScreenProps {
    handleCreatePlan: (days: number, studySpeed: 'Chill' | 'Normal' | 'Speedrun') => void;
}

const PlanningScreen: React.FC<PlanningScreenProps> = ({ handleCreatePlan }) => {
    const [days, setDays] = useState(30);
    const [studySpeed, setStudySpeed] = useState<'Chill' | 'Normal' | 'Speedrun'>('Normal');

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-4">
            <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold glow-text">Analysis Complete!</h2>
                <p className="mt-2 text-slate-300 text-lg">Your syllabus is decoded. Let's configure your quest.</p>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                if(days > 0) handleCreatePlan(days, studySpeed);
            }} className="mt-8 p-8 glow-card rounded-xl w-full max-w-lg">
                <div className="mb-6">
                    <label htmlFor="days" className="font-semibold text-lg text-slate-200 block text-center">How many days until your exams?</label>
                    <input 
                        type="number"
                        id="days"
                        name="days"
                        min="1"
                        max="365"
                        required
                        value={days}
                        onChange={e => setDays(parseInt(e.target.value))}
                        className="w-full mt-2 p-4 text-center bg-slate-900/50 border-2 border-slate-700 rounded-lg text-3xl font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    />
                </div>
                <div className="mb-8">
                     <label className="font-semibold text-lg text-slate-200 block text-center mb-3">Choose your study speed:</label>
                     <div className="grid grid-cols-3 gap-3">
                        {(['Chill', 'Normal', 'Speedrun'] as const).map(speed => (
                            <button key={speed} type="button" onClick={() => setStudySpeed(speed)} className={`p-4 rounded-lg font-bold transition-all ${studySpeed === speed ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                {speed}
                            </button>
                        ))}
                     </div>
                </div>
                <button
                    type="submit"
                    className="w-full px-12 py-4 text-xl font-bold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105 pulse-glow-button"
                >
                    Create My Quest
                </button>
            </form>
        </div>
      );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('UPLOADING');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [syllabusTopics, setSyllabusTopics] = useState<SyllabusTopic[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    level: 1,
    xp: 0,
    badges: [],
  });
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [leveledUpTo, setLeveledUpTo] = useState(0);

  const [showCamera, setShowCamera] = useState(false);

  const handleSyllabusSubmit = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing your syllabus...');
    setError(null);
    try {
      const topics = await geminiService.extractTopicsFromSyllabus(file);
      setSyllabusTopics(topics);
      setAppState('PLANNING');
    } catch (err) {
      console.error(err);
      setError('Failed to analyze syllabus. The file might be corrupted or the format is not supported. Please try again.');
      setAppState('UPLOADING');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreatePlan = useCallback(async (days: number, studySpeed: 'Chill' | 'Normal' | 'Speedrun') => {
    if (syllabusTopics.length === 0) return;
    setIsLoading(true);
    setLoadingMessage('Crafting your personalized quest...');
    setError(null);
    try {
      const plan = await geminiService.createStudyPlan(syllabusTopics, days, studySpeed);
      setStudyPlan(plan);
      setAppState('STUDYING');
      setUserProfile(prev => ({
        ...prev,
        badges: [...prev.badges, BADGES.PLAN_STARTED]
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to create a study plan. The AI might be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [syllabusTopics]);
  
  const handleCapture = (file: File) => {
    setShowCamera(false);
    handleSyllabusSubmit(file);
  };

  const handleMissionComplete = useCallback((missionId: string, quizScore: number) => {
    if (!studyPlan) return;

    let missionTopic: string | undefined;

    const updatedPlan = {
        ...studyPlan,
        days: studyPlan.days.map(day => ({
            ...day,
            // FIX: Add explicit return type to the map callback to prevent TypeScript
            // from incorrectly widening the 'status' property to 'string'.
            missions: day.missions.map((mission): Mission => {
                if (mission.id === missionId && mission.status === 'pending') {
                    missionTopic = mission.topic;
                    return { ...mission, status: 'completed' };
                }
                return mission;
            }),
        })),
    };
    
    if(!missionTopic) return; // Mission already completed

    setStudyPlan(updatedPlan);

    // Update user profile
    setUserProfile(prev => {
        const newXp = prev.xp + XP_PER_MISSION;
        let newLevel = prev.level;
        while (XP_FOR_LEVEL_UP[newLevel] && newXp >= XP_FOR_LEVEL_UP[newLevel]) {
            newLevel++;
        }
        
        if (newLevel > prev.level) {
            setLeveledUpTo(newLevel);
            setShowLevelUp(true);
        }

        const newBadges = [...prev.badges];
        if (prev.badges.length === 1) { // 1 because plan started badge is added
            newBadges.push(BADGES.FIRST_MISSION);
        }
        if (quizScore === 4) { // Assuming 4 questions in quiz
             if (!newBadges.some(b => b.name === BADGES.PERFECT_QUIZ.name)) {
                newBadges.push(BADGES.PERFECT_QUIZ);
             }
        }
        
        return {
            ...prev,
            xp: newXp,
            level: newLevel,
            badges: newBadges
        };
    });

    if(missionTopic) {
      setSelectedMission(prev => prev ? {...prev, status: 'completed'} : null);
    }
  }, [studyPlan]);

  return (
    <>
      {isLoading && <Loader message={loadingMessage} />}
      {error && (
        <div className="fixed top-5 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <p>{error}</p>
          <button onClick={() => { setError(null); setAppState('UPLOADING');}} className="font-bold mt-2">Try Again</button>
        </div>
      )}
      {showLevelUp && <LevelUpModal level={leveledUpTo} onClose={() => setShowLevelUp(false)} />}
      {showCamera && <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />}
      
      {appState === 'UPLOADING' && <SyllabusUploader onSyllabusSubmit={handleSyllabusSubmit} isLoading={isLoading} onOpenCamera={() => setShowCamera(true)} />}
      {appState === 'PLANNING' && <PlanningScreen handleCreatePlan={handleCreatePlan} />}
      {appState === 'STUDYING' && studyPlan && (
        <StudyDashboard plan={studyPlan} userProfile={userProfile} onMissionSelect={setSelectedMission} />
      )}
      
      {selectedMission && (
        <TopicModal 
            mission={selectedMission} 
            onClose={() => setSelectedMission(null)} 
            onMissionComplete={handleMissionComplete}
        />
      )}
      <footer className="text-center p-4 text-xs text-slate-500">
        © {new Date().getFullYear()} Tarunjit Biswas. All rights reserved.
      </footer>
    </>
  );
};

export default App;