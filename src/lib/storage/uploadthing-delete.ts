import { UTApi } from "uploadthing/server";

// Initialize UploadThing API client
const utapi = new UTApi();

/**
 * Deletes a file from UploadThing by its URL
 * @param fileUrl - The full URL of the file to delete
 * @returns Promise<boolean> - True if deletion was successful, false otherwise
 */
export async function deleteUploadThingFile(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl) {
      console.warn("No file URL provided for deletion");
      return false;
    }

    // Extract the file key from the URL
    // UploadThing URLs typically look like: https://utfs.io/f/[fileKey]
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const fileKey = pathParts[pathParts.length - 1];

    if (!fileKey) {
      console.warn("Could not extract file key from URL:", fileUrl);
      return false;
    }

    // Delete the file using UploadThing API
    const result = await utapi.deleteFiles([fileKey]);

    if (result.success) {
      return true;
    } else {
      console.error(`Failed to delete file: ${fileKey}`);
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error);
    return false;
  }
}

/**
 * Deletes multiple files from UploadThing by their URLs
 * @param fileUrls - Array of file URLs to delete
 * @returns Promise<{ success: boolean; deletedCount: number; errors: string[] }>
 */
export async function deleteUploadThingFiles(fileUrls: string[]): Promise<{
  success: boolean;
  deletedCount: number;
  errors: string[];
}> {
  const results = {
    success: true,
    deletedCount: 0,
    errors: [] as string[],
  };

  if (!fileUrls || fileUrls.length === 0) {
    return results;
  }

  // Extract file keys from URLs
  const fileKeys: string[] = [];
  const invalidUrls: string[] = [];

  for (const fileUrl of fileUrls) {
    try {
      if (!fileUrl) continue;

      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const fileKey = pathParts[pathParts.length - 1];

      if (fileKey) {
        fileKeys.push(fileKey);
      } else {
        invalidUrls.push(fileUrl);
      }
  } catch {
    invalidUrls.push(fileUrl);
  }
  }

  // Add invalid URLs to errors
  if (invalidUrls.length > 0) {
    results.errors.push(`Invalid URLs: ${invalidUrls.join(', ')}`);
  }

  if (fileKeys.length === 0) {
    results.success = false;
    return results;
  }

  try {
    // Delete files in batch
    const deleteResult = await utapi.deleteFiles(fileKeys);

    if (deleteResult.success) {
      results.deletedCount = fileKeys.length;
    } else {
      results.success = false;
      results.errors.push(`UploadThing deletion failed`);
    }
  } catch (error) {
    results.success = false;
    results.errors.push(`Error deleting files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return results;
}

/**
 * Extracts file URLs from a text field that might contain multiple URLs
 * @param text - Text that might contain file URLs
 * @returns Array of file URLs found in the text
 */
export function extractFileUrlsFromText(text: string): string[] {
  if (!text) return [];

  // Regex to match UploadThing URLs
  const uploadThingUrlRegex = /https:\/\/utfs\.io\/f\/[a-zA-Z0-9_-]+/g;
  const matches = text.match(uploadThingUrlRegex);

  return matches || [];
}

/**
 * Deletes files from UploadThing that are referenced in a text field
 * @param text - Text that might contain file URLs
 * @returns Promise<{ success: boolean; deletedCount: number; errors: string[] }>
 */
export async function deleteFilesFromText(text: string): Promise<{
  success: boolean;
  deletedCount: number;
  errors: string[];
}> {
  const fileUrls = extractFileUrlsFromText(text);
  return await deleteUploadThingFiles(fileUrls);
}
