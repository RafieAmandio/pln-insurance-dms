export const APP_ROLES = ['pic_gudang', 'pic_klaim', 'manager'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  pic_gudang: 'PIC Gudang',
  pic_klaim: 'PIC Klaim',
  manager: 'Manager',
};
