import type { Database } from '../../types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Ministry = Database['public']['Tables']['ministries']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];

export interface ScheduleSnapshot {
  members: Profile[];
  ministries: Ministry[];
  schedules: Schedule[];
}
