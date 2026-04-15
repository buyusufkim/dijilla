import { ref, uploadBytes, getDownloadURL } from "@/firebase";

/**
 * Uploads a file to Supabase Storage.
 * @param file The file to upload (Blob or File).
 * @param path The storage path (e.g., 'service_requests/tow/filename.jpg').
 * @returns An object containing the download URL and the storage path.
 */
export const uploadFile = async (file: Blob | File, path: string) => {
  try {
    const storageRef = ref(null, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: snapshot.ref.path,
      metadata: {
        size: (file as any).size || 0,
        contentType: (file as any).type || 'image/jpeg',
        timeCreated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("[StorageHelper] Upload failed:", error);
    throw new Error("Dosya yüklenirken bir hata oluştu.");
  }
};

/**
 * Converts a base64 string to a Blob.
 * @param base64 The base64 string.
 * @returns A Blob object.
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};
