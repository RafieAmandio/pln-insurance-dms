export type AppRole = 'pic_gudang' | 'pic_klaim' | 'manager';
export type DocumentStatus = 'draft' | 'reviewed' | 'approved' | 'archived';
export type AssetType = 'policy' | 'claim' | 'endorsement' | 'invoice' | 'correspondence' | 'photo' | 'report' | 'other';
export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ClaimStatus = 'open' | 'in_review' | 'approved' | 'denied' | 'closed';
export type AuditAction =
  | 'upload' | 'view' | 'download' | 'edit' | 'delete'
  | 'status_change' | 'ocr_complete' | 'link_claim' | 'unlink_claim'
  | 'review' | 'approve' | 'reject' | 'archive';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  asset_type: AssetType;
  policy_number: string;
  claim_number: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_hash: string;
  page_count: number;
  ocr_text: string;
  ocr_metadata: Record<string, unknown>;
  ocr_confidence: number;
  ocr_completed_at: string | null;
  search_vector: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  uploaded_by: string;
  reviewed_by: string | null;
  approved_by: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentBatch {
  id: string;
  name: string;
  total_files: number;
  processed_files: number;
  failed_files: number;
  status: BatchStatus;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  policy_number: string;
  claimant_name: string;
  description: string;
  claim_date: string | null;
  status: ClaimStatus;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  document_id: string;
  linked_by: string;
  linked_at: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  document_id: string | null;
  claim_id: string | null;
  action: AuditAction;
  actor_id: string;
  actor_email: string;
  actor_role: AppRole | null;
  old_status: string | null;
  new_status: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}
