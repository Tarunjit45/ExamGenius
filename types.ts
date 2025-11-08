import React from 'react';

export interface SyllabusTopic {
  subject: string;
  topics: string[];
}

export interface Mission {
  id: string;
  subject: string;
  topic: string;
  status: 'pending' | 'completed';
}

export interface DailyPlan {
  day: number;
  missions: Mission[];
}

export interface StudyPlan {
  days: DailyPlan[];
}

export interface UserProfileData {
  level: number;
  xp: number;
  // FIX: Use React.ReactElement for better type safety and to avoid global JSX namespace issues.
  // FIX: Specify that the icon accepts a className prop to allow for cloning with new styles.
  badges: { name: string; description: string; icon: React.ReactElement<{ className?: string }> }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StudyAids {
  notes?: string;
  summary?: string;
  mnemonics?: string;
  quiz?: QuizQuestion[];
}

export type AppState = 'UPLOADING' | 'PLANNING' | 'STUDYING';

export type AidType = 'notes' | 'summary' | 'mnemonics' | 'quiz';
