import { useRef, useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Ação',
    message = 'Tem certeza que deseja continuar? Esta ação não pode ser desfeita.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
    isDestructive = true
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <AlertTriangle className={`w-6 h-6 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 min-w-[100px]
                                ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isLoading ? 'Aguarde...' : confirmText}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
