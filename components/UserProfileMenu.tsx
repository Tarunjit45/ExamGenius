import React, { useState, useRef, useEffect } from 'react';
import type { UserProfileData } from '../types';
import { XP_FOR_LEVEL_UP } from '../constants';

interface UserProfileMenuProps {
    userProfile: UserProfileData;
    onSignOut: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ userProfile, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentLevelXP = XP_FOR_LEVEL_UP[userProfile.level - 1] || 0;
    const nextLevelXP = XP_FOR_LEVEL_UP[userProfile.level] || XP_FOR_LEVEL_UP[XP_FOR_LEVEL_UP.length - 1];
    const xpIntoLevel = userProfile.xp - currentLevelXP;
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const progressPercentage = xpForNextLevel > 0 ? (xpIntoLevel / xpForNextLevel) * 100 : 100;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-white ring-2 ring-purple-500/50 hover:ring-purple-500 transition-all overflow-hidden"
            >
                {userProfile.pictureUrl ? (
                    <img src={userProfile.pictureUrl} alt={userProfile.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                    userProfile.level
                )}
            </button>
            {isOpen && (
                <div className="absolute top-14 right-0 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                        {userProfile.pictureUrl && (
                             <img src={userProfile.pictureUrl} alt={userProfile.name || 'User'} className="w-10 h-10 rounded-full" />
                        )}
                        <div>
                            <p className="font-semibold text-slate-100 truncate">{userProfile.name || 'Study Warrior'}</p>
                            <p className="text-sm text-slate-400">Level {userProfile.level}</p>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>XP</span>
                            <span>{userProfile.xp} / {nextLevelXP}</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 my-4"></div>
                    <button
                        onClick={onSignOut}
                        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md"
                    >
                        Sign Out
                    </button>
                </div>
            )}
             <style>{`
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default UserProfileMenu;