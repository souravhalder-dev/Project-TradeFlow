import fs from 'fs/promises';
import path from 'path';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Stores uploaded file locally or in cloud object storage
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: 'products' | 'verification' | 'rfqs' | 'avatars' = 'products'
): Promise<UploadResult> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueName = `${Date.now()}-${sanitizedName}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, uniqueName);
  await fs.writeFile(filePath, fileBuffer);

  const publicUrl = `/uploads/${folder}/${uniqueName}`;

  return {
    url: publicUrl,
    fileName: sanitizedName,
    fileSize: fileBuffer.length,
    mimeType,
  };
}
