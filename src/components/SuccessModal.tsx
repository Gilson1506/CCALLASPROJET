import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function SuccessModal({ isOpen, onClose, title = "Sucesso!", message = "Sua mensagem foi enviada com sucesso." }: SuccessModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            setTimeout(() => setShow(false), 300);
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} relative z-10 text-center`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Check size={32} strokeWidth={3} />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 font-['Montserrat']">{title}</h3>
                <p className="text-gray-600 font-['Open_Sans'] mb-6">{message}</p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
