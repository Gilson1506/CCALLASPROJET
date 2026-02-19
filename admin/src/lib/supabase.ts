import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// USE WITH CAUTION: Using Service Role Key in client-side app bypasses all RLS!
// Only do this if this is a strictly internal admin tool.
const supabaseKey = supabaseServiceKey && supabaseServiceKey !== 'YOUR_SERVICE_ROLE_KEY_HERE'
    ? supabaseServiceKey
    : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============ Storage Helpers ============

export async function uploadImage(bucket: string, file: File, folder: string = ''): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
    });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
}

export async function uploadFile(bucket: string, file: File, folder: string = ''): Promise<{ url: string; name: string } | null> {
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${file.name}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
    });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { url: data.publicUrl, name: file.name };
}

export async function deleteFile(bucket: string, filePath: string): Promise<boolean> {
    // Extract path from full URL
    const urlParts = filePath.split(`/storage/v1/object/public/${bucket}/`);
    const path = urlParts.length > 1 ? urlParts[1] : filePath;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
        console.error('Delete error:', error);
        return false;
    }
    return true;
}
