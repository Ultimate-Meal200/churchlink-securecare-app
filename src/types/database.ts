export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = 'Admin' | 'Leader' | 'Member';
export type ScheduleStatus = 'Pending' | 'Confirmed' | 'Declined';
export type CheckinStatus = 'In' | 'Out';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: ProfileRole;
          phone: string | null;
          avatar: string | null;
        };
        Insert: {
          id: string;
          name: string;
          role: ProfileRole;
          phone?: string | null;
          avatar?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role?: ProfileRole;
          phone?: string | null;
          avatar?: string | null;
        };
      };
      ministries: {
        Row: {
          id: string;
          name: string;
          leader_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          leader_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          leader_id?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          ministry_id: string;
          member_id: string;
          date: string;
          status: ScheduleStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          ministry_id: string;
          member_id: string;
          date: string;
          status?: ScheduleStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          ministry_id?: string;
          member_id?: string;
          date?: string;
          status?: ScheduleStatus;
          created_at?: string;
        };
      };
      daycare_checkins: {
        Row: {
          id: string;
          child_name: string;
          parent_id: string;
          status: CheckinStatus;
          security_token: string;
          checkin_time: string;
        };
        Insert: {
          id?: string;
          child_name: string;
          parent_id: string;
          status?: CheckinStatus;
          security_token: string;
          checkin_time?: string;
        };
        Update: {
          id?: string;
          child_name?: string;
          parent_id?: string;
          status?: CheckinStatus;
          security_token?: string;
          checkin_time?: string;
        };
      };
      notification_jobs: {
        Row: {
          id: number;
          schedule_id: string;
          member_id: string;
          ministry_id: string;
          scheduled_for: string;
          delivery_channel: string;
          payload: Json;
          status: 'queued' | 'processing' | 'sent' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: number;
          schedule_id: string;
          member_id: string;
          ministry_id: string;
          scheduled_for: string;
          delivery_channel?: string;
          payload?: Json;
          status?: 'queued' | 'processing' | 'sent' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: number;
          schedule_id?: string;
          member_id?: string;
          ministry_id?: string;
          scheduled_for?: string;
          delivery_channel?: string;
          payload?: Json;
          status?: 'queued' | 'processing' | 'sent' | 'failed';
          created_at?: string;
        };
      };
    };
  };
}
