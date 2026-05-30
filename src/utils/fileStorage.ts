import {
    documentDirectory,
    makeDirectoryAsync,
    copyAsync,
    deleteAsync,
    getInfoAsync,
} from 'expo-file-system/legacy';

// Permanent folder (inside the app document directory) where saved records live.
export const RECORDS_DIR = documentDirectory + 'records/';

/** Create the records directory once if it does not exist yet. */
export async function ensureRecordsDir(): Promise<void> {
    const info = await getInfoAsync(RECORDS_DIR);
    if (!info.exists) {
        await makeDirectoryAsync(RECORDS_DIR, { intermediates: true });
    }
}

/** Copy a freshly recorded cache file into permanent storage, return its new uri. */
export async function persistRecording(cacheUri: string, id: string): Promise<string> {
    await ensureRecordsDir();
    const extension = cacheUri.split('.').pop() || 'm4a';
    const destUri = `${RECORDS_DIR}${id}.${extension}`;
    await copyAsync({ from: cacheUri, to: destUri });
    return destUri;
}

/** Delete a stored file, ignoring the case where it is already gone. */
export async function deleteFile(uri: string): Promise<void> {
    await deleteAsync(uri, { idempotent: true });
}
