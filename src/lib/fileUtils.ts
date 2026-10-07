/**
 * fileUtils.ts
 * Utilities for working with Files, Blobs, and Object URLs
 */

// Format file sizes for human readability
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Map of generated object URLs to track and revoke them
// We use a Map to keep track of the blob -> url relationship
const objectUrlCache = new WeakMap<Blob, string>();

/**
 * Creates an Object URL for a Blob/File and caches it.
 * If the Blob already has a URL, returns the cached one.
 */
export function getObjectUrl(blob: Blob | File): string {
  if (objectUrlCache.has(blob)) {
    return objectUrlCache.get(blob)!;
  }
  
  const url = URL.createObjectURL(blob);
  objectUrlCache.set(blob, url);
  return url;
}

/**
 * Revokes an object URL to free memory.
 * Note: Only do this when the Blob is entirely removed from the UI.
 */
export function revokeObjectUrl(blob: Blob | File) {
  if (objectUrlCache.has(blob)) {
    URL.revokeObjectURL(objectUrlCache.get(blob)!);
    objectUrlCache.delete(blob);
  }
}

/**
 * Convert a File object to an ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

