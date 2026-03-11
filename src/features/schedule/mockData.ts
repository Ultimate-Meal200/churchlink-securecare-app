import type { Ministry, Profile, Schedule } from './types';
import { toIsoDate } from '../../utils/date';

export const mockProfiles: Profile[] = [
  {
    id: '0a4fb401-0066-4479-bdfc-87bc0b132001',
    name: 'Janelle Carter',
    role: 'Leader',
    phone: '(555) 111-2290',
    avatar: null,
  },
  {
    id: '0a4fb401-0066-4479-bdfc-87bc0b132002',
    name: 'Samuel Brooks',
    role: 'Member',
    phone: '(555) 222-1844',
    avatar: null,
  },
  {
    id: '0a4fb401-0066-4479-bdfc-87bc0b132003',
    name: 'Maya Hughes',
    role: 'Member',
    phone: '(555) 444-0198',
    avatar: null,
  },
  {
    id: '0a4fb401-0066-4479-bdfc-87bc0b132004',
    name: 'Nolan Ellis',
    role: 'Member',
    phone: '(555) 301-1190',
    avatar: null,
  },
  {
    id: '0a4fb401-0066-4479-bdfc-87bc0b132005',
    name: 'Priya Townsend',
    role: 'Admin',
    phone: '(555) 999-1112',
    avatar: null,
  },
];

export const mockMinistries: Ministry[] = [
  {
    id: 'e8d71d57-6aa0-4650-b859-b9ac5b1e8001',
    name: 'Worship',
    leader_id: '0a4fb401-0066-4479-bdfc-87bc0b132001',
  },
  {
    id: 'e8d71d57-6aa0-4650-b859-b9ac5b1e8002',
    name: 'Greeters',
    leader_id: '0a4fb401-0066-4479-bdfc-87bc0b132001',
  },
  {
    id: 'e8d71d57-6aa0-4650-b859-b9ac5b1e8003',
    name: 'Kids Ministry',
    leader_id: '0a4fb401-0066-4479-bdfc-87bc0b132001',
  },
];

function buildSeedSchedules(monthOffset: number): Schedule[] {
  const month = new Date();
  month.setMonth(month.getMonth() + monthOffset);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  return [
    {
      id: `sched-${monthOffset}-1`,
      ministry_id: mockMinistries[0].id,
      member_id: mockProfiles[1].id,
      date: toIsoDate(new Date(year, monthIndex, 4)),
      status: 'Confirmed',
      created_at: new Date().toISOString(),
    },
    {
      id: `sched-${monthOffset}-2`,
      ministry_id: mockMinistries[1].id,
      member_id: mockProfiles[2].id,
      date: toIsoDate(new Date(year, monthIndex, 11)),
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
    {
      id: `sched-${monthOffset}-3`,
      ministry_id: mockMinistries[2].id,
      member_id: mockProfiles[3].id,
      date: toIsoDate(new Date(year, monthIndex, 18)),
      status: 'Confirmed',
      created_at: new Date().toISOString(),
    },
    {
      id: `sched-${monthOffset}-4`,
      ministry_id: mockMinistries[0].id,
      member_id: mockProfiles[2].id,
      date: toIsoDate(new Date(year, monthIndex, 25)),
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
  ];
}

let mockSchedulesStore: Schedule[] = [
  ...buildSeedSchedules(-1),
  ...buildSeedSchedules(0),
  ...buildSeedSchedules(1),
];

export function getMockSchedulesForMonth(monthAnchor: Date) {
  const targetMonth = `${monthAnchor.getMonth() + 1}`.padStart(2, '0');
  const targetYear = `${monthAnchor.getFullYear()}`;

  return mockSchedulesStore.filter((schedule) => {
    const [year, month] = schedule.date.split('-');
    return year === targetYear && month === targetMonth;
  });
}

export function addMockSchedule(schedule: Schedule) {
  mockSchedulesStore = [schedule, ...mockSchedulesStore];
}

export function hasMockScheduleConflict(memberId: string, isoDate: string) {
  return mockSchedulesStore.some(
    (schedule) => schedule.member_id === memberId && schedule.date === isoDate,
  );
}
