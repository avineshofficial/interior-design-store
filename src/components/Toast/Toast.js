import React, { useState, useEffect, createContext, useContext } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = toastId++;
        setToasts(prev => [...prev, { id, message, type }]);

        // Automatically remove toast after some time
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {toast.message}
                        <button onClick={() => removeToast(toast.id)} className="toast-close-btn">&times;</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};