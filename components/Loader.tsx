
import React, { useState, useEffect } from 'react';
import { loadingMessages } from '../constants';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  const [dynamicMessage, setDynamicMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 backdrop-blur-sm">
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <g filter="url(#glow-filter)">
          <circle cx="60" cy="60" r="40" stroke="url(#gradient)" strokeWidth="4" fill="none">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 60"
              to="360 60 60"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="60" cy="60" r="30" stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="10 5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 60 60"
              to="0 60 60"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="60" cy="60" r="50" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.6">
             <animate attributeName="r" from="45" to="55" dur="1.5s" repeatCount="indefinite" begin="0s" calcMode="spline" keySplines="0.165, 0.84, 0.44, 1"/>
             <animate attributeName="opacity" from="0.2" to="0.8" dur="1.5s" repeatCount="indefinite" begin="0s" calcMode="spline" keySplines="0.165, 0.84, 0.44, 1"/>
          </circle>
        </g>
      </svg>
      <p className="text-2xl font-bold mt-6 text-slate-100 glow-text">{message}</p>
      <p className="text-md mt-2 text-slate-400">{dynamicMessage}</p>
    </div>
  );
};

export default Loader;
