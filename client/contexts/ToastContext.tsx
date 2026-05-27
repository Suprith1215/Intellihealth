
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl border flex items-center justify-between animate-fade-in transition-all duration-300 transform translate-x-0 ${toast.type === 'success' ? 'bg-[#0f0a1e] border-green-500/30 text-white' :
                                toast.type === 'error' ? 'bg-[#0f0a1e] border-red-500/30 text-white' :
                                    'bg-[#0f0a1e] border-blue-500/30 text-white'
                            }`}
                    >
                        <div className="flex items-center">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 mr-3" />}
                            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 mr-3" />}
                            <div>
                                <p className="font-bold text-sm">
                                    {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
                                </p>
                                <p className="text-sm text-slate-300">{toast.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
