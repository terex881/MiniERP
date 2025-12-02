import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { env } from '../config/env';

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_PATH);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types for claims attachments
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

// Storage configuration
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    // Create subdirectory by year/month for organization
    const now = new Date();
    const subDir = path.join(
      uploadDir,
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, '0')
    );
    
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    
    callback(null, subDir);
  },
  filename: (req, file, callback) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${uniqueId}${ext}`;
    callback(null, filename);
  },
});

// Multer instance for single file upload
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE,
    files: 1,
  },
}).single('file');

// Multer instance for multiple file upload (max 5)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE,
    files: 5,
  },
}).array('files', 5);

// Helper to delete a file
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Helper to get file info
export function getFileInfo(file: Express.Multer.File): {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
} {
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
  };
}

