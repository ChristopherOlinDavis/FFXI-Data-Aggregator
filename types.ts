
export interface WikiSourceData {
  source: 'BG-Wiki' | 'FFXiclopedia';
  url: string;
  description: string;
  stats: Record<string, string | number>;
  acquisition: string[];
}

export interface FFXIItem {
  id: string;
  name: string;
  level: number;
  jobs: string[];
  slots: string[];
  bgData?: WikiSourceData;
  clopediaData?: WikiSourceData;
  validatedData?: {
    description: string;
    stats: Record<string, string | number>;
    status: 'pending' | 'reconciled' | 'conflict';
    aiSummary?: string;
  };
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PIPELINE = 'PIPELINE',
  EXPLORER = 'EXPLORER',
  RECONCILIATION = 'RECONCILIATION'
}

export interface AggregatorLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  item?: string;
}
