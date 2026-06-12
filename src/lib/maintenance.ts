import { promises as fs } from "fs";
import path from "path";
import { db } from "./db";

const MAX_BACKUPS = 10;
const GRACE_PERIOD_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Perform SQLite database backup
 */
export async function runBackup() {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const backupDir = path.join(process.cwd(), "backups");

  // Ensure backup directory exists
  await fs.mkdir(backupDir, { recursive: true });

  // Generate timestamp for filename: YYYY-MM-DD_HH-mm-ss
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const backupFilename = `dev-${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFilename);

  // Copy database file
  await fs.copyFile(dbPath, backupPath);

  // Maintain backup rotation (Keep only the latest MAX_BACKUPS backups)
  const files = await fs.readdir(backupDir);
  const backupFiles = files
    .filter(f => f.startsWith("dev-") && f.endsWith(".db"))
    .map(f => ({
      name: f,
      path: path.join(backupDir, f),
    }));

  // Sort alphabetically (which works chronologically due to YYYY-MM-DD_HH-mm-ss formatting)
  backupFiles.sort((a, b) => a.name.localeCompare(b.name));

  let deletedCount = 0;
  if (backupFiles.length > MAX_BACKUPS) {
    const toDelete = backupFiles.slice(0, backupFiles.length - MAX_BACKUPS);
    for (const file of toDelete) {
      await fs.unlink(file.path);
      deletedCount++;
    }
  }

  return {
    success: true,
    backupFile: backupFilename,
    totalBackups: Math.min(backupFiles.length, MAX_BACKUPS),
    deletedBackupsCount: deletedCount,
  };
}

/**
 * Clean up orphaned uploaded files in public/uploads/
 * A file is considered orphaned if:
 * 1. It is not referenced in any JournalEntry.attachmentUrl
 * 2. It is older than 1 hour (grace period to avoid deleting currently-uploaded files)
 */
export async function runOrphanCleanup() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  
  // Ensure upload directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    // Directory doesn't exist, nothing to clean
    return { success: true, deletedFiles: [], deletedFilesCount: 0 };
  }

  // Get all files currently in the upload directory
  const files = await fs.readdir(uploadDir);
  
  // Query all journal entry attachment URLs
  const journalEntries = await db.journalEntry.findMany({
    where: {
      attachmentUrl: { not: null }
    },
    select: {
      attachmentUrl: true
    }
  });

  // Extract filenames from DB paths (e.g. "/uploads/filename.jpg" -> "filename.jpg")
  const activeFilenames = new Set(
    journalEntries
      .map(je => je.attachmentUrl)
      .filter((url): url is string => !!url)
      .map(url => path.basename(url))
  );

  const deletedFiles: string[] = [];
  const now = Date.now();

  for (const filename of files) {
    const filePath = path.join(uploadDir, filename);
    const stats = await fs.stat(filePath);
    
    // Skip directories
    if (stats.isDirectory()) continue;

    // Check if the file is not referenced in DB
    if (!activeFilenames.has(filename)) {
      // Check if it exceeds the grace period (older than 1 hour)
      const fileAgeMs = now - stats.mtime.getTime();
      if (fileAgeMs > GRACE_PERIOD_MS) {
        await fs.unlink(filePath);
        deletedFiles.push(filename);
      }
    }
  }

  return {
    success: true,
    deletedFilesCount: deletedFiles.length,
    deletedFiles,
  };
}
