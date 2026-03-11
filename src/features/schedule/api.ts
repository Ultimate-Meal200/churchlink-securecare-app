import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { getNotificationTriggerDate, monthBounds, toIsoDate } from '../../utils/date';
import { addMockSchedule, getMockSchedulesForMonth, hasMockScheduleConflict, mockMinistries, mockProfiles } from './mockData';
import type { Schedule, ScheduleSnapshot } from './types';

interface AssignScheduleInput {
  ministryId: string;
  memberId: string;
  assignmentDate: string;
}

export async function loadScheduleSnapshot(monthAnchor: Date): Promise<ScheduleSnapshot> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      members: mockProfiles,
      ministries: mockMinistries,
      schedules: getMockSchedulesForMonth(monthAnchor),
    };
  }

  const { start, end } = monthBounds(monthAnchor);
  const rangeStart = toIsoDate(start);
  const rangeEnd = toIsoDate(end);

  const [profilesResult, ministriesResult, schedulesResult] = await Promise.all([
    supabase.from('profiles').select('*').order('name', { ascending: true }),
    supabase.from('ministries').select('*').order('name', { ascending: true }),
    supabase.from('schedules').select('*').gte('date', rangeStart).lte('date', rangeEnd).order('date'),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (ministriesResult.error) {
    throw ministriesResult.error;
  }

  if (schedulesResult.error) {
    throw schedulesResult.error;
  }

  return {
    members: profilesResult.data,
    ministries: ministriesResult.data,
    schedules: schedulesResult.data,
  };
}

export async function assignMemberToSchedule({
  ministryId,
  memberId,
  assignmentDate,
}: AssignScheduleInput): Promise<Schedule> {
  if (!isSupabaseConfigured || !supabase) {
    if (hasMockScheduleConflict(memberId, assignmentDate)) {
      throw new Error('This member is already scheduled on that day.');
    }

    const mockSchedule: Schedule = {
      id: `mock-${Date.now()}`,
      ministry_id: ministryId,
      member_id: memberId,
      date: assignmentDate,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    addMockSchedule(mockSchedule);
    return mockSchedule;
  }

  const existingResult = await supabase
    .from('schedules')
    .select('id')
    .eq('member_id', memberId)
    .eq('date', assignmentDate)
    .maybeSingle();

  if (existingResult.error && existingResult.error.code !== 'PGRST116') {
    throw existingResult.error;
  }

  if (existingResult.data) {
    throw new Error('This member is already scheduled on that day.');
  }

  const insertResult = await supabase
    .from('schedules')
    .insert({
      ministry_id: ministryId,
      member_id: memberId,
      date: assignmentDate,
      status: 'Pending',
    })
    .select()
    .single();

  if (insertResult.error) {
    throw insertResult.error;
  }

  const assignmentDateObject = new Date(`${assignmentDate}T12:00:00`);
  const notificationDate = getNotificationTriggerDate(assignmentDateObject);

  const functionResult = await supabase.functions.invoke('schedule-assignment-notification', {
    body: {
      scheduleId: insertResult.data.id,
      memberId,
      ministryId,
      scheduledFor: notificationDate.toISOString(),
      assignmentDate,
    },
  });

  if (functionResult.error) {
    throw functionResult.error;
  }

  return insertResult.data;
}
