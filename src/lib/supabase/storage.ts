import { supabase } from '../../supabase';
import { isSupabaseConfigured } from './config';

export const ref = (storageInstance: any, path: string) => {
  return { path };
};

export const uploadBytes = async (ref: { path: string }, data: Blob | Uint8Array | ArrayBuffer) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured for storage.");
  }

  // Extract bucket and file path from the path string
  // Expected format: bucketName/filePath
  const parts = ref.path.split('/');
  const bucket = parts[0];
  const filePath = parts.slice(1).join('/');

  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, data, {
      upsert: true
    });

  if (error) throw error;
  return { ref, metadata: uploadData };
};

export const getDownloadURL = async (ref: { path: string }) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured for storage.");
  }

  const parts = ref.path.split('/');
  const bucket = parts[0];
  const filePath = parts.slice(1).join('/');

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteObject = async (ref: { path: string }) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured for storage.");
  }

  const parts = ref.path.split('/');
  const bucket = parts[0];
  const filePath = parts.slice(1).join('/');

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
};
