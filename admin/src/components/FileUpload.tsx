import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { uploadFile as supabaseUploadFile } from '../lib/supabase';

interface FileUploadProps {
    label: string;
    value: string;
    onChange: (url: string, fileName: string) => void;
    accept?: string;
    fileName?: string;
    bucket?: string;
    folder?: string;
}

export default function FileUpload({ label, value, onChange, accept = '.pdf,.ics,.xlsx', fileName, bucket = 'files', folder = 'calendar' }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (file: File) => {
        setUploading(true);
        try {
            const result = await supabaseUploadFile(bucket, file, folder);
            if (result) {
                onChange(result.url, result.name);
            } else {
                const url = URL.createObjectURL(file);
                onChange(url, file.name);
            }
        } catch {
            const url = URL.createObjectURL(file);
            onChange(url, file.name);
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
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText size={14} />{label}
            </label>

            {value ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText size={20} className="text-green-600" />
                    <span className="text-sm text-green-700 flex-1 truncate">{fileName || 'Arquivo selecionado'}</span>
                    <button type="button" onClick={() => onChange('', '')} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
                </div>
            ) : (
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${uploading ? 'border-blue-400 bg-blue-50' :
                            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                        }`}>
                    {uploading ? (
                        <>
                            <Loader2 size={20} className="mx-auto text-blue-500 mb-2 animate-spin" />
                            <p className="text-sm text-blue-600 font-medium">Enviando...</p>
                        </>
                    ) : (
                        <>
                            <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Selecione o arquivo</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, ICS, ou Excel</p>
                        </>
                    )}
                </div>
            )}

            <input ref={fileInputRef} type="file" accept={accept} className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
        </div>
    );
}
