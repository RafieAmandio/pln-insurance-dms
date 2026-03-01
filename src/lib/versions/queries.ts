import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppRole } from '@/lib/db/types';

export async function getDocumentVersions(
  supabase: SupabaseClient,
  documentId: string
) {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*, profiles:created_by(full_name, email)')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch versions: ${error.message}`);
  }

  return data;
}

export async function createVersion(
  supabase: SupabaseClient,
  documentId: string,
  description: string,
  filePath: string,
  fileSize: number,
  createdBy: string
) {
  // Get current version number
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('version')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error('Document not found');
  }

  const newVersionNumber = (document.version ?? 0) + 1;

  // Insert version record
  const { data: version, error: versionError } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: newVersionNumber,
      description,
      file_path: filePath,
      file_size: fileSize,
      created_by: createdBy,
    })
    .select()
    .single();

  if (versionError) {
    throw new Error(`Failed to create version: ${versionError.message}`);
  }

  // Update document version counter
  const { error: updateError } = await supabase
    .from('documents')
    .update({ version: newVersionNumber })
    .eq('id', documentId);

  if (updateError) {
    throw new Error(`Failed to update document version: ${updateError.message}`);
  }

  return version;
}

export async function restoreVersion(
  supabase: SupabaseClient,
  documentId: string,
  versionNumber: number,
  userId: string
) {
  // Fetch the version to restore
  const { data: oldVersion, error: fetchError } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .eq('version_number', versionNumber)
    .single();

  if (fetchError || !oldVersion) {
    throw new Error('Version not found');
  }

  // Update document with the old version's file_path
  const { error: updateError } = await supabase
    .from('documents')
    .update({ file_path: oldVersion.file_path })
    .eq('id', documentId);

  if (updateError) {
    throw new Error(`Failed to restore version: ${updateError.message}`);
  }

  // Create a new version entry describing the restore
  const restoredVersion = await createVersion(
    supabase,
    documentId,
    `Restored from version ${versionNumber}`,
    oldVersion.file_path,
    oldVersion.file_size,
    userId
  );

  return restoredVersion;
}

export async function lockDocument(
  supabase: SupabaseClient,
  documentId: string,
  userId: string
) {
  // Check current lock status
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('locked_by, locked_at')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    throw new Error('Document not found');
  }

  if (document.locked_by && document.locked_by !== userId) {
    throw new Error('Document is already locked by another user');
  }

  const { data, error } = await supabase
    .from('documents')
    .update({
      locked_by: userId,
      locked_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select('locked_by, locked_at')
    .single();

  if (error) {
    throw new Error(`Failed to lock document: ${error.message}`);
  }

  return data;
}

export async function unlockDocument(
  supabase: SupabaseClient,
  documentId: string,
  userId: string,
  userRole?: AppRole
) {
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('locked_by')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    throw new Error('Document not found');
  }

  const canUnlock =
    document.locked_by === userId ||
    userRole === 'manager' ||
    userRole === 'super_admin';

  if (!canUnlock) {
    throw new Error('Only the locking user, manager, or super_admin can unlock');
  }

  const { error } = await supabase
    .from('documents')
    .update({
      locked_by: null,
      locked_at: null,
    })
    .eq('id', documentId);

  if (error) {
    throw new Error(`Failed to unlock document: ${error.message}`);
  }
}

export async function getDocumentLockStatus(
  supabase: SupabaseClient,
  documentId: string
) {
  const { data, error } = await supabase
    .from('documents')
    .select('locked_by, locked_at, profiles:locked_by(full_name, email)')
    .eq('id', documentId)
    .single();

  if (error) {
    throw new Error(`Failed to get lock status: ${error.message}`);
  }

  return {
    isLocked: !!data.locked_by,
    lockedBy: data.locked_by,
    lockedAt: data.locked_at,
    lockedByProfile: data.profiles,
  };
}
