import { backupEnvelope } from '../data/database';
import { validateBackup } from '../domain/validation';
import type { BackupEnvelope } from '../domain/types';

export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

export async function readBackupFile(file: File): Promise<BackupEnvelope> {
  if (file.size > MAX_BACKUP_BYTES) throw new Error('This backup is larger than the 50 MB import limit.');
  if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') throw new Error('Choose a JSON backup file.');
  let contents: unknown;
  try { contents = JSON.parse(await file.text()) as unknown; }
  catch { throw new Error('This file is not valid JSON. Your existing data was not changed.'); }
  try { return validateBackup(contents); }
  catch (error) {
    const detail = error instanceof Error ? error.message : 'The backup structure is not supported.';
    throw new Error(`Backup validation failed: ${detail} Your existing data was not changed.`);
  }
}

export async function downloadBackup(): Promise<void> {
  const envelope = await backupEnvelope();
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `iraworks-commitment-counter-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
