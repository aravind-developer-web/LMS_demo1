import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    const bgColor = styles[type] || styles.success;

    return (
        <div
            className={`fixed bottom-8 right-8 ${bgColor} text-white px-6 py-4 rounded-xl shadow-strong z-50 animate-fade-in flex items-center gap-3`}
            role="alert"
        >
            {type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            )}
            {type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            )}
            {type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            )}
            <span className="font-semibold">{message}</span>
            <button
                onClick={onClose}
                className="ml-4 hover:opacity-80 transition-opacity"
                aria-label="Close notification"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    );
};

export default Toast;
