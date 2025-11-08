import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Mission, StudyAids, AidType, QuizQuestion } from '../types';
import * as geminiService from '../services/geminiService';

// Declaring marked as it's loaded from a script tag in index.html
declare const marked: any;

interface TopicModalProps {
  mission: Mission;
  onClose: () => void;
  onMissionComplete: (missionId: string, quizScore: number) => void;
}

const tabs: { id: AidType; label: string }[] = [
  { id: 'notes', label: 'Notes' },
  { id: 'summary', label: 'Summary' },
  { id: 'mnemonics', label: 'Mnemonics' },
  { id: 'quiz', label: 'Quiz' },
];

const AidContent: React.FC<{ content: string }> = ({ content }) => {
  const htmlContent = marked.parse(content || '');
  return (
    <div
      className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-purple-400 prose-ul:list-disc prose-ol:list-decimal"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

const Confetti: React.FC = () => {
    const confettiItems = useMemo(() => Array.from({ length: 50 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 3}s`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#A855F7', '#4F46E5', '#34D399', '#FBBF24'][Math.floor(Math.random() * 4)],
        };
        return <div key={i} className="confetti-piece" style={style}></div>;
    }), []);

    return <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">{confettiItems}</div>;
};


const QuizComponent: React.FC<{ quiz: QuizQuestion[]; onQuizComplete: (score: number) => void }> = ({ quiz, onQuizComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerSelect = (option: string) => {
        if (isSubmitted) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = option;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        const score = selectedAnswers.reduce((acc, answer, index) => {
            return answer === quiz[index].correctAnswer ? acc + 1 : acc;
        }, 0);
        onQuizComplete(score);
    };

    const currentQuestion = quiz[currentQuestionIndex];
    const score = selectedAnswers.reduce((acc, answer, index) => answer === quiz[index].correctAnswer ? acc + 1 : acc, 0);

    if (isSubmitted) {
        return (
            <div className="text-center relative">
                <Confetti />
                <h3 className="text-3xl font-bold text-slate-100 glow-text">Quiz Complete!</h3>
                <p className="text-6xl font-extrabold my-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">{score} / {quiz.length}</p>
                <p className="text-slate-300">🎉 You just mastered this topic! +{XP_PER_MISSION} XP 🎉</p>
                <p className="text-slate-400 mt-2">Close this window to continue your quest.</p>
            </div>
        )
    }

    return (
        <div>
            <p className="text-sm text-slate-400 mb-2">Question {currentQuestionIndex + 1} of {quiz.length}</p>
            <h4 className="text-xl font-semibold text-slate-100 mb-4">{currentQuestion.question}</h4>
            <div className="space-y-3">
                {currentQuestion.options.map(option => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === option;
                    return (
                        <button
                            key={option}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors text-base ${isSelected ? 'bg-purple-600 border-purple-500 text-white font-bold' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end">
                {currentQuestionIndex < quiz.length - 1 ? (
                    <button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]} className="px-6 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-slate-600 disabled:opacity-50 transition-all">Next</button>
                ) : (
                    <button onClick={handleSubmit} disabled={selectedAnswers.includes(null)} className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-600 disabled:opacity-50 transition-all">Submit Quiz</button>
                )}
            </div>
        </div>
    );
};

import { XP_PER_MISSION } from '../constants';

const TopicModal: React.FC<TopicModalProps> = ({ mission, onClose, onMissionComplete }) => {
  const [activeTab, setActiveTab] = useState<AidType>('notes');
  const [studyAids, setStudyAids] = useState<StudyAids>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAid = useCallback(async (type: AidType) => {
    if (studyAids[type]) return; // Already fetched

    setIsLoading(true);
    setError(null);
    try {
      let content: string | QuizQuestion[] | undefined;
      if (type === 'quiz') {
        content = await geminiService.generateQuiz(mission.topic, mission.subject);
      } else {
        content = await geminiService.generateStudyAid(mission.topic, mission.subject, type);
      }
      setStudyAids(prev => ({ ...prev, [type]: content }));
    } catch (err) {
      console.error(err);
      setError(`Failed to generate ${type}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [mission.subject, mission.topic, studyAids]);

  useEffect(() => {
    fetchAid(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleQuizComplete = (score: number) => {
    onMissionComplete(mission.id, score);
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 flex justify-center items-center p-4" onClick={onClose}>
        <style>{`
            .confetti-piece {
                position: absolute;
                width: 8px;
                height: 16px;
                top: -20px;
                opacity: 0;
                animation: drop linear forwards;
            }
            @keyframes drop {
                0% { transform: translateY(0) rotateZ(0); opacity: 1; }
                100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
            }
        `}</style>
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden glow-card" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-slate-700/50 flex justify-between items-start">
          <div>
            <p className="text-purple-400 font-semibold">{mission.subject}</p>
            <h2 className="text-3xl font-bold text-slate-100">{mission.topic}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <nav className="w-48 border-r border-slate-700/50 p-4">
            <ul className="space-y-2">
              {tabs.map(tab => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors text-lg ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="flex-1 p-8 overflow-y-auto">
            {isLoading && <div className="text-center text-slate-400">Generating...</div>}
            {error && <div className="text-center text-red-400">{error}</div>}
            
            {!isLoading && !error && activeTab === 'notes' && studyAids.notes && <AidContent content={studyAids.notes} />}
            {!isLoading && !error && activeTab === 'summary' && studyAids.summary && <AidContent content={studyAids.summary} />}
            {!isLoading && !error && activeTab === 'mnemonics' && studyAids.mnemonics && <AidContent content={studyAids.mnemonics} />}
            {!isLoading && !error && activeTab === 'quiz' && studyAids.quiz && (
              mission.status === 'completed' ? 
              <div className="text-center text-green-400 font-bold text-xl">You have already completed this mission's quiz!</div> :
              <QuizComponent quiz={studyAids.quiz} onQuizComplete={handleQuizComplete} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TopicModal;