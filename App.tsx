import React, { useState, useCallback, useEffect } from 'react';
import SyllabusUploader from './components/SyllabusUploader';
import StudyDashboard from './components/StudyDashboard';
import TopicModal from './components/TopicModal';
import Loader from './components/Loader';
import CameraCapture from './components/CameraCapture';
import Header from './components/Header';
import * as geminiService from './services/geminiService';
import type { AppState, SyllabusTopic, StudyPlan, UserProfileData, Mission } from './types';
import { XP_PER_MISSION, XP_FOR_LEVEL_UP, BADGES } from './constants';

// To inform TypeScript about the global 'google' object from the script tag
declare const google: any;

const initialUserProfile: UserProfileData = {
  level: 1,
  xp: 0,
  badges: [],
  id: undefined,
  name: undefined,
  pictureUrl: undefined,
};

const LevelUpModal: React.FC<{ level: number, onClose: () => void }> = ({ level, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex justify-center items-center" onClick={onClose}>
            <div className="text-center transform transition-all animate-pop-in">
                <p className="text-4xl font-bold text-yellow-300">LEVEL UP!</p>
                <p className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 glow-text">{level}</p>
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
                <h2 className="text-5xl font-bold glow-text">Analysis Complete!</h2>
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
  const [userProfile, setUserProfile] = useState<UserProfileData>(initialUserProfile);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [leveledUpTo, setLeveledUpTo] = useState(0);

  const [showCamera, setShowCamera] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGsiAvailable, setIsGsiAvailable] = useState(false);

  const decodeJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
  };

  const handleSignOut = () => {
    const userId = userProfile.id;
    if (userId) {
        localStorage.removeItem(`examGeniusSession_${userId}`);
    }
    
    setIsLoggedIn(false);
    setStudyPlan(null);
    setUserProfile(initialUserProfile);
    setSyllabusTopics([]);
    setAppState('UPLOADING');
    setError(null);

    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
  };

  const handleCredentialResponse = useCallback((response: any) => {
    const decoded = decodeJwt(response.credential);
    if (!decoded || !decoded.sub) {
        setError("Google Sign-In failed. Please try again.");
        return;
    }
    
    const userId = decoded.sub;
    const userName = decoded.name;
    const userPicture = decoded.picture;

    setIsLoggedIn(true);

    try {
        const savedSession = localStorage.getItem(`examGeniusSession_${userId}`);
        if (savedSession) {
            const { plan, profile } = JSON.parse(savedSession);
            const profileWithIcons = {
                ...profile,
                id: userId,
                name: userName,
                pictureUrl: userPicture,
                badges: (profile.badges || []).map((badge: any) => {
                    if (badge.name.includes('Adept')) {
                        const subject = badge.name.replace(' Adept', '');
                        return BADGES.SUBJECT_MASTER(subject);
                    }
                    const badgeKey = Object.keys(BADGES).find(key => (BADGES[key as keyof typeof BADGES] as any).name === badge.name);
                    return badgeKey ? BADGES[badgeKey as keyof typeof BADGES] : badge;
                })
            };
            
            if (plan && profile) {
                setStudyPlan(plan);
                setUserProfile(profileWithIcons);
                setAppState('STUDYING');
            }
        } else {
            setUserProfile({
                ...initialUserProfile,
                id: userId,
                name: userName,
                pictureUrl: userPicture,
            });
            setAppState('UPLOADING');
        }
    } catch (e) {
        console.error("Failed to load or process session:", e);
        setUserProfile({
            ...initialUserProfile,
            id: userId,
            name: userName,
            pictureUrl: userPicture,
        });
    }
  }, []);

  // Effect to initialize Google Sign-In button
  useEffect(() => {
    if (!isLoggedIn) {
        const checkGoogle = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                clearInterval(checkGoogle);

                const clientId = process.env.GOOGLE_CLIENT_ID;
                const isClientIdValid = clientId && !clientId.startsWith('YOUR_GOOGLE_CLIENT_ID');

                if (isClientIdValid) {
                    setIsGsiAvailable(true);
                    google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        use_fedcm_for_prompt: false
                    });
                    const signInButtonContainer = document.getElementById("signInButtonContainer");
                    if (signInButtonContainer) {
                        google.accounts.id.renderButton(
                            signInButtonContainer,
                            { theme: "outline", size: "large", type: "standard", text: "signin_with" }
                        );
                    }
                    google.accounts.id.prompt(); // One-tap sign-in
                } else {
                    setIsGsiAvailable(false);
                    console.warn("Google Client ID is not configured. Sign-in will be disabled.");
                }
            }
        }, 100);
        return () => clearInterval(checkGoogle);
    }
  }, [isLoggedIn, handleCredentialResponse]);


  // Save session to localStorage whenever plan or profile changes for a logged-in user
  useEffect(() => {
    if (isLoggedIn && userProfile.id && studyPlan) {
        try {
            const profileToSave = {
                ...userProfile,
                badges: userProfile.badges.map(({ name, description }) => ({ name, description }))
            };
            const sessionData = JSON.stringify({ plan: studyPlan, profile: profileToSave });
            localStorage.setItem(`examGeniusSession_${userProfile.id}`, sessionData);
        } catch (e) {
            console.error("Failed to save session:", e);
        }
    }
  }, [studyPlan, userProfile, isLoggedIn]);

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
        const existingBadgeNames = new Set(newBadges.map(b => b.name));

        if (prev.badges.length === 1 && !existingBadgeNames.has(BADGES.FIRST_MISSION.name)) {
            newBadges.push(BADGES.FIRST_MISSION);
        }
        if (quizScore === 4 && !existingBadgeNames.has(BADGES.PERFECT_QUIZ.name)) {
            newBadges.push(BADGES.PERFECT_QUIZ);
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

  const renderContent = () => {
    if (!isLoggedIn) {
        return <SyllabusUploader onSyllabusSubmit={handleSyllabusSubmit} isLoading={isLoading} onOpenCamera={() => setShowCamera(true)} />;
    }
    switch (appState) {
        case 'UPLOADING':
            return <SyllabusUploader onSyllabusSubmit={handleSyllabusSubmit} isLoading={isLoading} onOpenCamera={() => setShowCamera(true)} />;
        case 'PLANNING':
            return <PlanningScreen handleCreatePlan={handleCreatePlan} />;
        case 'STUDYING':
            if(studyPlan) {
                return <StudyDashboard plan={studyPlan} userProfile={userProfile} onMissionSelect={setSelectedMission} />;
            }
            // Fallback if plan is null for some reason
            setAppState('UPLOADING');
            return null;
        default:
            return <SyllabusUploader onSyllabusSubmit={handleSyllabusSubmit} isLoading={isLoading} onOpenCamera={() => setShowCamera(true)} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <Header 
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        isGsiAvailable={isGsiAvailable}
      />
      <main className="pt-20"> {/* Add padding to offset fixed header */}
        {isLoading && <Loader message={loadingMessage} />}
        {error && (
          <div className="fixed top-24 right-5 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
            <p>{error}</p>
            <button onClick={() => { setError(null); setAppState('UPLOADING');}} className="font-bold mt-2">Try Again</button>
          </div>
        )}
        {showLevelUp && <LevelUpModal level={leveledUpTo} onClose={() => setShowLevelUp(false)} />}
        {showCamera && <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />}
        
        {renderContent()}
        
        {selectedMission && (
          <TopicModal 
              mission={selectedMission} 
              onClose={() => setSelectedMission(null)} 
              onMissionComplete={handleMissionComplete}
          />
        )}
      </main>
      <footer className="text-center p-4 text-xs text-slate-500">
        © {new Date().getFullYear()} Tarunjit Biswas. All rights reserved.
      </footer>
    </div>
  );
};

export default App;