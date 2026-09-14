export interface PhoneTimeRecord {
  id?: string | number;
  date_of_shift: string; // e.g. "08/07/2026" or "2026-09-14"
  name: string; // Agent / Trainer / Employee Name
  account: string; // e.g. "DFT", "RM", "BF", "XPN", etc.
  total_minutes: string; // e.g. "28 minutes, 49 seconds" or "15.5 mins"
  ticket_number: string; // e.g. "f7efd2dd"
  tagging: string; // e.g. "HOLD, Best plan", "Requested Info due to Past Due"
  summary: string; // Detailed call or task summary
  created_at?: string;
}

export interface AccountOption {
  account_id?: number | string;
  account_code: string;
  account_name: string;
}

export interface EmployeeOption {
  id: number | string;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
}

export interface FilterState {
  search: string;
  account: string;
  agent: string;
  tag: string;
  dateFilter: string;
}

export interface KpiSummaryStats {
  totalRecords: number;
  totalDurationFormatted: string;
  totalSeconds: number;
  averageDurationFormatted: string;
  uniqueAgentsCount: number;
  uniqueAccountsCount: number;
  topTag: string;
}
