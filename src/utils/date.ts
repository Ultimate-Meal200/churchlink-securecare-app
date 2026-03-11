import type { Schedule } from '../features/schedule/types';

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface CalendarDay {
  date: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  assignments: number;
  confirmed: number;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function monthBounds(date: Date) {
  const start = startOfMonth(date);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

export function getNotificationTriggerDate(assignmentDate: Date) {
  const next = new Date(assignmentDate);
  next.setDate(next.getDate() - 14);
  return next;
}

export function buildCalendarDays(monthAnchor: Date, schedules: Schedule[]): CalendarDay[] {
  const monthStart = startOfMonth(monthAnchor);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());

  const todayIso = toIsoDate(new Date());
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const dateKey = toIsoDate(date);
    const daySchedules = schedules.filter((entry) => entry.date === dateKey);

    days.push({
      date: dateKey,
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === monthAnchor.getMonth(),
      isToday: dateKey === todayIso,
      assignments: daySchedules.length,
      confirmed: daySchedules.filter((entry) => entry.status === 'Confirmed').length,
    });
  }

  return days;
}
