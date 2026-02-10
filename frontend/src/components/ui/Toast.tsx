import React, { useEffect } from 'react';

interface ToastProps {
  message: { type: 'success' | 'error'; text: string } | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500); // 1.5 seconds as requested
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] text-base font-bold flex items-center gap-3 z-[9999] border-2 animate-in fade-in slide-in-from-top-4 duration-300 print:hidden ${
      message.type === 'success' 
        ? 'bg-green-600 text-white border-green-400' 
        : 'bg-red-600 text-white border-red-400'
    }`}>
      <span className="text-2xl">{message.type === 'success' ? '✅' : '❌'}</span>
      {message.text}
    </div>
  );
};
