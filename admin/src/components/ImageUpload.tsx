import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/supabase';

interface ImageUploadProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    className?: string;
    previewHeight?: string;
    bucket?: string;
    folder?: string;
}

export default function ImageUpload({
    label, value, onChange,
    placeholder = 'Selecione ou cole URL da imagem',
    className = '', previewHeight = 'h-40',
    bucket = 'images', folder = ''
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const url = await uploadImage(bucket, file, folder);
            if (url) {
                onChange(url);
            } else {
                // Fallback to local preview if upload fails
                const localUrl = URL.createObjectURL(file);
                onChange(localUrl);
            }
        } catch {
            const localUrl = URL.createObjectURL(file);
            onChange(localUrl);
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={14} />{label}
            </label>

            {value ? (
                <div className="relative group">
                    <img src={value} alt="Preview" className={`w-full ${previewHeight} object-cover rounded-lg border border-gray-200`} />
                    <button type="button" onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${uploading ? 'border-blue-400 bg-blue-50' :
                            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                        }`}>
                    {uploading ? (
                        <>
                            <Loader2 size={24} className="mx-auto text-blue-500 mb-2 animate-spin" />
                            <p className="text-sm text-blue-600 font-medium">Enviando para Supabase...</p>
                        </>
                    ) : (
                        <>
                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">{placeholder}</p>
                            <p className="text-xs text-gray-400 mt-1">Arraste e solte ou clique para selecionar</p>
                        </>
                    )}
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

            <input type="url" placeholder="Ou cole a URL da imagem..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none"
                value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
}
