export const APP_ROLES = ['pic_gudang', 'pic_klaim', 'manager', 'super_admin', 'document_control', 'operations', 'compliance', 'read_only'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  pic_gudang: 'PIC Gudang',
  pic_klaim: 'PIC Klaim',
  manager: 'Manager',
  super_admin: 'Super Admin',
  document_control: 'Document Control',
  operations: 'Operations',
  compliance: 'Compliance',
  read_only: 'Read Only',
};
