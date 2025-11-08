import React from 'react';
import type { UserProfileData } from '../types';
import UserProfileMenu from './UserProfileMenu';

interface HeaderProps {
    isLoggedIn: boolean;
    userProfile: UserProfileData;
    onSignOut: () => void;
    isGsiAvailable: boolean;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, userProfile, onSignOut, isGsiAvailable }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800 z-30 flex items-center justify-between px-4 md:px-8">
            <h1 className="text-3xl font-bold glow-text">
                ExamGenius
            </h1>
            <div>
                {isLoggedIn ? (
                    <UserProfileMenu userProfile={userProfile} onSignOut={onSignOut} />
                ) : (
                    isGsiAvailable ? (
                        <div id="signInButtonContainer" style={{ height: '40px' }}></div>
                    ) : (
                        <div className="text-sm text-slate-400 p-2 bg-slate-800 rounded-md">
                            Sign-In Unavailable
                        </div>
                    )
                )}
            </div>
        </header>
    );
};

export default Header;