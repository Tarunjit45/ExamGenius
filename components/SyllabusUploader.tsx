import React, { useState, useCallback, useRef } from 'react';

interface SyllabusUploaderProps {
  onSyllabusSubmit: (file: File) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
}

const SyllabusUploader: React.FC<SyllabusUploaderProps> = ({ onSyllabusSubmit, isLoading, onOpenCamera }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
        onSyllabusSubmit(selectedFile);
      } else {
        setError('Please upload an image or PDF file.');
        setFile(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
       if (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError('');
        onSyllabusSubmit(droppedFile);
      } else {
        setError('Please upload an image or PDF file.');
        setFile(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleCameraClick = () => {
    onOpenCamera();
  };

  if(file && isLoading) {
    return null; // The main App component will show the loader
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold glow-text">
          🚀 Welcome to ExamGenius
        </h1>
        <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-2xl">
          Study Less, Play Smart.
        </p>
      </div>

      <div className="mt-16 w-full max-w-md p-8 glow-card rounded-xl">
        <h2 className="text-2xl font-bold text-center text-slate-100">Upload or Scan Your Syllabus</h2>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1 px-6 py-10 text-lg font-bold text-white bg-purple-600/20 border border-purple-600 rounded-lg shadow-lg hover:bg-purple-600/40 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex flex-col items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                Upload File
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
                disabled={isLoading}
            />
            <button
                onClick={handleCameraClick}
                disabled={isLoading}
                className="flex-1 px-6 py-10 text-lg font-bold text-white bg-indigo-600/20 border border-indigo-600 rounded-lg shadow-lg hover:bg-indigo-600/40 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex flex-col items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                Use Camera
            </button>
        </div>
        
        {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
        
        <div 
          className="hidden relative border-2 border-dashed border-slate-600 rounded-xl p-8 mt-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
            <p>Or drop file here</p>
        </div>
      </div>
    </div>
  );
};

export default SyllabusUploader;