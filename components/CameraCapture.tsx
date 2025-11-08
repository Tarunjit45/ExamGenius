import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions and try again.");
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCaptureClick = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], 'syllabus-capture.jpg', { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-center items-center p-4">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <button onClick={onCancel} className="mt-4 px-6 py-2 bg-slate-600 rounded-lg font-semibold hover:bg-slate-700">Close</button>
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          </div>
          <div className="mt-6 flex gap-4">
            <button onClick={onCancel} className="px-6 py-3 bg-slate-600 rounded-lg font-semibold hover:bg-slate-700 transition-colors">Cancel</button>
            <button onClick={handleCaptureClick} className="px-8 py-3 bg-purple-600 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
              Capture
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </>
      )}
    </div>
  );
};
export default CameraCapture;
